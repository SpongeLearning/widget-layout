import Node from "./node";
import { DIRECTION, ILayoutNode, IWidgetNode, NODE_TYPE } from "./type";
import WidgetNode from "./widget_node";

class LayoutNode extends Node implements ILayoutNode {
    direction: DIRECTION;

    root: LayoutNode;
    parent?: LayoutNode;
    children: (LayoutNode | WidgetNode)[] = [];

    constructor(node: ILayoutNode, root?: LayoutNode) {
        super(node.id, node.type);
        this.root = root ? root : this;
        this.children = node.children
            .map((child) => {
                switch (child.type) {
                    case NODE_TYPE.LAYOUT_NODE: {
                        const node = new LayoutNode(
                            child as ILayoutNode,
                            this.root
                        );
                        node.appendTo(this);
                        return node;
                    }
                    case NODE_TYPE.WIDGET_NODE: {
                        const node = new WidgetNode(
                            child as IWidgetNode,
                            this.root
                        );
                        node.appendTo(this);
                        return node;
                    }
                    default: {
                        return null;
                    }
                }
            })
            .filter((child) => child != null) as Array<LayoutNode | WidgetNode>;

        this.direction = node.direction;
    }

    replaceNode(
        toReplace: LayoutNode | WidgetNode,
        node: LayoutNode | WidgetNode
    ) {
        const index = this.children.findIndex(
            (child) => child.id === toReplace.id
        );
        console.log("index", index, toReplace.id, node.id, this.children);
        if (index !== -1) {
            this.children.splice(index, 1, node);
            node.offset = toReplace.offset;
            node.parent = toReplace.parent;
        }
    }

    updateChildrenOffset(position: number, offset: number) {
        if (this.children[position - 1]) {
            this.children[position - 1].offset =
                this.children[position - 1].offset + offset;
        }

        if (this.children[position + 1]) {
            this.children[position + 1].offset =
                this.children[position + 1].offset - offset;
        }
    }
}

export default LayoutNode;
