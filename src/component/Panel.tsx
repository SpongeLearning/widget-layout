import React from "react";

import { PanelNode, useNode } from "../lib";

const Panel = (props: { nodeId: string }) => {
    const { nodeId } = props;
    console.debug("Update Panel", nodeId);

    const node = useNode(nodeId) as PanelNode;

    return (
        <div style={{ height: "100%", width: "100%", overflow: "hidden" }}>
            <node.Page />
        </div>
    );
};

export default Panel;
