import { useEffect, useState } from "react";

import { Node, NODE_EVENT, useNode } from "../lib";

const useChildNodes = (nodeId: string) => {
    const node = useNode(nodeId) as Node;
    const [childNodes, setChildNodes] = useState(node.children);
    useEffect(() => {
        node.on(NODE_EVENT.UPDATE, () => {
            setChildNodes([...node.children]);
        });
        return () => {
            node.removeAllListeners();
        };
    }, [node]);
    return childNodes;
};

export default useChildNodes;
