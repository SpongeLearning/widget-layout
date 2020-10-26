import React, { createContext, FC } from "react";

import { Node } from "../lib";

export const context = createContext<Node | null>(null);

const Provider: FC<{ value: Node }> = (props) => {
    const { value, children } = props;
    return <context.Provider value={value}>{children}</context.Provider>;
};

export default Provider;
