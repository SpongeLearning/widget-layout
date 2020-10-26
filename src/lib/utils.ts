import { useContext, useMemo } from "react";

import { context } from "../component";
import { BaseNode, LayoutNode, MASK_PART, Node, WidgetNode } from ".";

export const findNode = (node: BaseNode, id: string): BaseNode | undefined => {
    if (node.id === id) {
        return node;
    }
    if (node instanceof Node) {
        for (const child of node.children) {
            let found = findNode(child, id);
            if (found != null) {
                return found;
            }
        }
    }
};

export const useNode = (id: string): BaseNode | undefined => {
    const root = useContext(context)!;
    const node = useMemo(() => findNode(root, id), [id, root]);
    return node;
};

export const useParentNode = (id: string): Node | undefined => {
    const node = useNode(id);
    const parent = useMemo(() => node?.parent, [node]);
    return parent;
};

export const moveNode = (
    node: BaseNode,
    to: Node,
    position: MASK_PART | number
) => {
    switch (position) {
        case MASK_PART.CENTER:
            removeNode(node);
            node.appendTo(to);
            break;

        default:
            break;
    }
};

export const removeNode = (node: BaseNode) => {
    const index = node.parent?.children.findIndex(
        (child) => child.id === node.id
    );
    if (index != null && index !== -1) {
        if (node instanceof WidgetNode) {
            node.parent?.updateChildrenOffset(index, node.offset);
        }
        node.parent?.children.splice(index, 1);
    }
};

export const shakeTree = (node: Node) => {
    let shake = false;
    if (node.children.length === 0 && node.id !== "root") {
        removeNode(node);
        shake = true;
    }
    if (node instanceof LayoutNode) {
        if (node.children.length === 1 && node.id !== "root") {
            node.parent?.replaceNode(node, node.children[0]);
            shake = true;
        }

        node.children.forEach((layout, index) => {
            if (layout instanceof LayoutNode) {
                if (layout.direction === node.direction) {
                    layout.children[0].offset += node.children[index].offset;
                    node.children.splice(index, 1, ...layout.children);
                    shake = true;
                    layout.children.forEach((c) => (c.parent = node));
                }
            }
        });
    }

    return shake;
};
