import { uniqueId } from "lodash";
import { useContext, useMemo } from "react";

import { context } from "../component";
import { BaseNode, LayoutNode, MASK_PART, Node, WidgetNode } from ".";
import PanelNode from "./panel_node";
import { DIRECTION, NODE_TYPE } from "./type";

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

export const movePanelToWidget = (
    panel: PanelNode,
    node: WidgetNode,
    position?: number,
    deleteNode = false
) => {
    panel.parent = node;

    if (position == null || position > node.children.length) {
        position = node.children.length;
    }
    node.children.splice(position, deleteNode ? 1 : 0, panel);
};

export const moveNodeToLayout = (
    node: WidgetNode | LayoutNode,
    layout: LayoutNode,
    position?: number,
    deleteNode = false
) => {
    node.offset = 0;
    node.parent = layout;

    if (position == null || position > layout.children.length) {
        position = layout.children.length;
    }
    layout.children.splice(position, deleteNode ? 1 : 0, node);
};

export const moveNode = (
    dragNode: PanelNode,
    dropNode: WidgetNode,
    maskPosition: MASK_PART
) => {
    if (maskPosition === MASK_PART.CENTER) {
        removeNode(dragNode);
        movePanelToWidget(dragNode, dropNode);
    }

    if (
        (dropNode.parent?.direction === DIRECTION.ROW ||
            dropNode.parent?.direction === DIRECTION.ROWREV) &&
        (maskPosition === MASK_PART.RIGHT || maskPosition === MASK_PART.LEFT)
    ) {
        let index = dropNode.parent.children.findIndex(
            (child) => child.id === dropNode.id
        );
        if (index !== -1) {
            const widget = new WidgetNode(
                {
                    id: uniqueId(),
                    type: NODE_TYPE.WIDGET_NODE,
                    children: [],
                },
                dropNode.root
            );
            removeNode(dragNode);
            movePanelToWidget(dragNode, widget);
            index = maskPosition === MASK_PART.LEFT ? index : index + 1;
            moveNodeToLayout(widget, dropNode.parent, index);
        }
    }

    if (
        (dropNode.parent?.direction === DIRECTION.COLUMN ||
            dropNode.parent?.direction === DIRECTION.COLUMNREV) &&
        (maskPosition === MASK_PART.BOTTOM || maskPosition === MASK_PART.TOP)
    ) {
        let index = dropNode.parent.children.findIndex(
            (child) => child.id === dropNode.id
        );
        if (index !== -1) {
            const widget = new WidgetNode(
                {
                    id: uniqueId(),
                    type: NODE_TYPE.WIDGET_NODE,
                    children: [],
                },
                dropNode.root
            );
            removeNode(dragNode);
            movePanelToWidget(dragNode, widget);

            index = maskPosition === MASK_PART.TOP ? index : index + 1;
            moveNodeToLayout(widget, dropNode.parent, index);
        }
    }

    if (
        (dropNode.parent?.direction === DIRECTION.ROW ||
            dropNode.parent?.direction === DIRECTION.ROWREV) &&
        (maskPosition === MASK_PART.BOTTOM || maskPosition === MASK_PART.TOP)
    ) {
        const layout = new LayoutNode(
            {
                id: uniqueId(),
                type: NODE_TYPE.LAYOUT_NODE,
                direction: DIRECTION.COLUMN,
                children: [],
            },
            dropNode.root
        );

        const widget = new WidgetNode(
            {
                id: uniqueId(),
                type: NODE_TYPE.WIDGET_NODE,
                children: [],
            },
            dropNode.root
        );

        replaceNode(dropNode, layout);

        removeNode(dragNode);
        movePanelToWidget(dragNode, widget);

        moveNodeToLayout(dropNode, layout);

        maskPosition === MASK_PART.TOP
            ? moveNodeToLayout(widget, layout, 0)
            : moveNodeToLayout(widget, layout);
    }

    if (
        (dropNode.parent?.direction === DIRECTION.COLUMN ||
            dropNode.parent?.direction === DIRECTION.COLUMNREV) &&
        (maskPosition === MASK_PART.RIGHT || maskPosition === MASK_PART.LEFT)
    ) {
        const layout = new LayoutNode(
            {
                id: uniqueId(),
                type: NODE_TYPE.LAYOUT_NODE,
                direction: DIRECTION.ROW,
                children: [],
            },
            dropNode.root
        );

        const widget = new WidgetNode(
            {
                id: uniqueId(),
                type: NODE_TYPE.WIDGET_NODE,
                children: [],
            },
            dropNode.root
        );

        replaceNode(dropNode, layout);

        removeNode(dragNode);
        movePanelToWidget(dragNode, widget);

        moveNodeToLayout(dropNode, layout);

        maskPosition === MASK_PART.LEFT
            ? moveNodeToLayout(widget, layout, 0)
            : moveNodeToLayout(widget, layout);
    }

    dropNode.root.update();
};

export const removeNode = (node: BaseNode) => {
    const index = node.parent?.children.findIndex(
        (child) => child.id === node.id
    );
    if (index != null && index !== -1) {
        if (node instanceof WidgetNode) {
            if (node.parent != null) {
                updateChildrenOffset(node.parent, index, node.offset);
            }
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
            replaceNode(node, node.children[0]);
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

export const updateChildrenOffset = (
    node: LayoutNode,
    position: number,
    offset: number
) => {
    if (node.children[position - 1]) {
        node.children[position - 1].offset =
            node.children[position - 1].offset + offset;
    }

    if (node.children[position + 1]) {
        node.children[position + 1].offset =
            node.children[position + 1].offset - offset;
    }
};

export const replaceNode = (
    toReplace: LayoutNode | WidgetNode,
    node: LayoutNode | WidgetNode
) => {
    const index = toReplace.parent?.children.findIndex(
        (child) => child.id === toReplace.id
    );

    if (index != null && index !== -1) {
        toReplace.parent?.children.splice(index, 1, node);
        node.offset = toReplace.offset;
        node.parent = toReplace.parent;
    }
};
