import LayoutNode from "./layout_node";
import Node from "./node";
import PanelNode from "./panel_node";
import { IWidgetNode } from "./type";
import { movePanelToWidget } from "./utils";

class WidgetNode extends Node {
    root: LayoutNode;
    parent?: LayoutNode;
    children: PanelNode[] = [];

    constructor(node: IWidgetNode, root: LayoutNode) {
        super(node.id, node.type);
        this.root = root;
        this.children = node.children.map((child) => {
            const node = new PanelNode(child, root);
            movePanelToWidget(node, this);
            return node;
        });
    }
}

export default WidgetNode;
