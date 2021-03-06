import {
    ForwardRefExoticComponent,
    FunctionComponent,
    RefAttributes,
} from "react";

export enum NODE_EVENT {
    UPDATE = "UPDATE",
}

export enum DIRECTION {
    COLUMN = "column",
    COLUMNREV = "column-reverse",
    ROW = "row",
    ROWREV = "row-reverse",
}

export enum NODE_TYPE {
    LAYOUT_NODE = "LAYOUT_NODE",
    WIDGET_NODE = "WIDGET_NODE",
    PANEL = "PANEL",
}

export interface IBaseNode {
    id: string;
    type: NODE_TYPE;
}

export interface INode<N extends IBaseNode> extends IBaseNode {
    children: N[];
}

export interface IPanelNode extends IBaseNode {
    Page: FunctionComponent;
    Tab?: ForwardRefExoticComponent<
        {
            nodeId: string;
            nodeTitle: string;
            onClose: () => void;
            onSelect: () => void;
        } & RefAttributes<HTMLDivElement>
    >;
    title: string;
}

export interface IWidgetNode extends INode<IPanelNode> {}

export interface ILayoutNode extends INode<ILayoutNode | IWidgetNode> {
    direction: DIRECTION;
}

export enum MASK_PART {
    TOP = "top",
    LEFT = "left",
    BOTTOM = "bottom",
    RIGHT = "right",
    CENTER = "center",
}
