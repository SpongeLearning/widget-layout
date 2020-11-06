import { makeStyles } from "@material-ui/styles";
import React, { Fragment, useEffect, useRef } from "react";

import { useChildNodes } from "../hook";
import { DIRECTION, NODE_TYPE, useNode } from "../lib";
import LayoutNode from "../lib/layout_node";
import Splitter from "./Splitter";
import Widget from "./Widget";

const useStyle = makeStyles({
    layout: (props: {
        parentDirection: DIRECTION | undefined;
        nodeDirection: DIRECTION;
        length: number | undefined;
        offset: number;
    }) => {
        const { nodeDirection, parentDirection, length, offset } = props;
        const size = length || 1;
        const splitterOffset = (10 * (size - 1)) / size;
        const width =
            length != null &&
            (parentDirection === DIRECTION.ROW ||
                parentDirection === DIRECTION.ROWREV)
                ? `calc(${100 / length}% - ${splitterOffset}px + ${offset}px)`
                : "100%";

        const height =
            length != null &&
            (parentDirection === DIRECTION.COLUMN ||
                parentDirection === DIRECTION.COLUMNREV)
                ? `calc(${100 / length}% - ${splitterOffset}px + ${offset}px)`
                : "100%";

        return {
            width,
            height,
            display: "flex",
            flexDirection: nodeDirection,
        };
    },
});

const Layout = (props: { nodeId: string }) => {
    const { nodeId } = props;
    console.debug("Update Layout", nodeId);

    const ref = useRef<HTMLDivElement>(null);
    const node = useNode(nodeId) as LayoutNode;
    const childNodes = useChildNodes(nodeId);
    const classes = useStyle({
        parentDirection: node.parent?.direction,
        nodeDirection: node.direction,
        length: node.parent?.children.length,
        offset: node.offset,
    });

    useEffect(() => {
        node.width = ref.current!.getBoundingClientRect().width;
        node.height = ref.current!.getBoundingClientRect().height;
    }, [childNodes, node]);

    return (
        <div id={nodeId} ref={ref} className={classes.layout}>
            {childNodes.map((child, index, array) => (
                <Fragment key={child.id}>
                    {child.type === NODE_TYPE.WIDGET_NODE ? (
                        <Widget key={child.id} nodeId={child.id} />
                    ) : null}
                    {child.type === NODE_TYPE.LAYOUT_NODE ? (
                        <Layout key={child.id} nodeId={child.id} />
                    ) : null}

                    {array.length === index + 1 ? null : (
                        <Splitter
                            parentId={nodeId}
                            primaryId={child.id}
                            secondaryId={array[index + 1].id}
                            inTime={false}
                        />
                    )}
                </Fragment>
            ))}
        </div>
    );
};

export default Layout;
