import Node from "./node";
import { DIRECTION, ILayoutNode, IWidgetNode, NODE_TYPE } from "./type";
import { moveNodeToLayout } from "./utils";
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
                        moveNodeToLayout(node, this);
                        return node;
                    }
                    case NODE_TYPE.WIDGET_NODE: {
                        const node = new WidgetNode(
                            child as IWidgetNode,
                            this.root
                        );
                        moveNodeToLayout(node, this);
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
}

export default LayoutNode;
