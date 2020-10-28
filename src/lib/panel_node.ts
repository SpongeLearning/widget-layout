import {
    ForwardRefExoticComponent,
    FunctionComponent,
    RefAttributes,
} from "react";

import { CustomTab } from "../component";
import BaseNode from "./base_node";
import LayoutNode from "./layout_node";
import { IPanelNode } from "./type";
import WidgetNode from "./widget_node";

class PanelNode extends BaseNode implements IPanelNode {
    Page: FunctionComponent;
    Tab: ForwardRefExoticComponent<
        {
            nodeId: string;
            nodeTitle: string;
            onClose: () => void;
            onSelect: () => void;
        } & RefAttributes<HTMLDivElement>
    > = CustomTab;
    title: string;
    selected: boolean = false;
    parent?: WidgetNode;
    root: LayoutNode;

    constructor(node: IPanelNode, root: LayoutNode) {
        super(node.id, node.type);
        this.id = node.id;
        this.Page = node.Page;
        this.Tab = node.Tab ? node.Tab : this.Tab;
        this.title = node.title;
        this.root = root;
    }
}

export default PanelNode;
