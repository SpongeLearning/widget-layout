import interact from "interactjs";
import React, { useCallback, useEffect, useRef } from "react";

import { removeNode, useNode } from "../lib";
import PanelNode from "../lib/panel_node";

const Tab = (props: {
    nodeId: string;
    selected: string;
    onSelect: (nodeId: string) => void;
}) => {
    const { nodeId, selected, onSelect } = props;
    const ref = useRef(null);
    const node = useNode(nodeId) as PanelNode;

    const onClick = useCallback(() => {
        onSelect(nodeId);
    }, [nodeId, onSelect]);

    useEffect(() => {
        interact(ref.current!).draggable({
            cursorChecker: () => {
                return "default";
            },
        });
    }, [onClick]);

    useEffect(() => {
        if (nodeId === selected) {
            node.selected = true;
            node.parent?.update();
        } else {
            node.selected = false;
            node.parent?.update();
        }
    }, [node, nodeId, selected]);

    const closeTab = useCallback(() => {
        removeNode(node);
        node.root.update();
    }, [node]);

    return (
        <node.Tab
            nodeId={nodeId}
            nodeTitle={node.title}
            ref={ref}
            onSelect={onClick}
            onClose={closeTab}
        />
    );
};

export default Tab;
