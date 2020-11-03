import React, { createContext, FC } from "react";

import { DIRECTION, ILayoutNode, LayoutNode, Node, NODE_TYPE } from "../lib";

const json: ILayoutNode = {
    id: "root",
    type: NODE_TYPE.LAYOUT_NODE,
    direction: DIRECTION.COLUMN,
    children: [],
};

const rootNode = new LayoutNode(json);

export const context = createContext<Node>(rootNode);

const Provider: FC<{ value: Node }> = (props) => {
    const { value, children } = props;
    return <context.Provider value={value}>{children}</context.Provider>;
};

export default Provider;
