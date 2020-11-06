import { makeStyles } from "@material-ui/styles";
import interact from "interactjs";
import React, { useEffect, useMemo, useRef } from "react";

import { useChildNodes, useStateContainer } from "../hook";
import {
    DIRECTION,
    findNode,
    MASK_PART,
    moveNode,
    PanelNode,
    useNode,
} from "../lib";
import WidgetNode from "../lib/widget_node";
import Panel from "./Panel";
import Titlebar from "./Titlebar";

const useStyle = makeStyles({
    widget: (props: { node: WidgetNode }) => {
        const { node } = props;
        const parent = node.parent;
        const size = parent?.children.length || 1;
        const splitterOffset = (10 * (size - 1)) / size;
        const width =
            parent?.direction === DIRECTION.ROW ||
            parent?.direction === DIRECTION.ROWREV
                ? `calc(${
                      100 / parent.children.length
                  }% - ${splitterOffset}px + ${node.offset}px)`
                : "100%";

        const height =
            parent?.direction === DIRECTION.COLUMN ||
            parent?.direction === DIRECTION.COLUMNREV
                ? `calc(${
                      100 / parent.children.length
                  }% - ${splitterOffset}px + ${node.offset}px)`
                : "100%";

        return {
            width,
            height,
        };
    },
    titlebar: () => ({
        height: "25px",
        display: "flex",
    }),
    panel: () => ({
        position: "relative",
        height: "calc(100% - 25px)",
    }),
    top: {
        zIndex: 1,
        pointerEvents: "none",
        border: "2px dashed",
        position: "absolute",
        width: "calc(100% - 4px)",
        height: "50%",
        top: 0,
        left: 0,
    },
    left: {
        zIndex: 1,
        pointerEvents: "none",
        border: "2px dashed",
        position: "absolute",
        width: "50%",
        height: "calc(100% - 4px)",
        top: 0,
        left: 0,
    },
    bottom: {
        zIndex: 1,
        pointerEvents: "none",
        border: "2px dashed",
        position: "absolute",
        width: "calc(100% - 4px)",
        height: "50%",
        right: 0,
        bottom: 0,
    },
    right: {
        zIndex: 1,
        pointerEvents: "none",
        border: "2px dashed",
        position: "absolute",
        width: "50%",
        height: "calc(100% - 4px)",
        bottom: 0,
        right: 0,
    },
    center: {
        zIndex: 1,
        pointerEvents: "none",
        border: "2px dashed",
        position: "absolute",
        width: "calc(100% - 4px)",
        height: "calc(100% - 4px)",
        bottom: 0,
        right: 0,
    },
    hide: {
        display: "none",
    },
});

const Widget = (props: { nodeId: string }) => {
    const { nodeId } = props;
    console.debug("Update Widget", nodeId);

    const node = useNode(nodeId) as WidgetNode;
    const classes = useStyle({ node });

    const childNodes = useChildNodes(nodeId) as PanelNode[];

    const ref = useRef<HTMLDivElement>(null);

    const widgetRef = useRef<HTMLDivElement>(null);
    const [
        maskPartContainer,
        maskPart,
        setMaskPart,
    ] = useStateContainer<MASK_PART | null>(null);

    useEffect(() => {
        node.width = ref.current!.getBoundingClientRect().width;
        node.height = ref.current!.getBoundingClientRect().height;
    }, [childNodes, node]);

    useEffect(() => {
        const interactable = interact(widgetRef.current!)
            .dropzone({
                accept: ".Tab",
            })
            .on("drop", (event) => {
                const dragNode = findNode(
                    node.root,
                    event.dragEvent.target.id
                ) as PanelNode;

                moveNode(dragNode, node, maskPartContainer.current!);

                setMaskPart(null);
            })
            .on("dropmove", (event) => {
                const rect = widgetRef.current?.getBoundingClientRect();
                if (rect) {
                    if (
                        event.dragEvent.client.x > rect.x + rect.width / 4 &&
                        event.dragEvent.client.x <
                            rect.x + (rect.width / 4) * 3 &&
                        event.dragEvent.client.y > rect.y + rect.height / 4 &&
                        event.dragEvent.client.y <
                            rect.y + (rect.height / 4) * 3
                    ) {
                        setMaskPart(MASK_PART.CENTER);
                        return;
                    }
                    if (
                        event.dragEvent.client.x > rect.x &&
                        event.dragEvent.client.x < rect.x + rect.width / 4
                    ) {
                        setMaskPart(MASK_PART.LEFT);
                        return;
                    }

                    if (
                        event.dragEvent.client.x >
                            rect.x + (rect.width / 4) * 3 &&
                        event.dragEvent.client.x < rect.x + rect.width
                    ) {
                        setMaskPart(MASK_PART.RIGHT);
                        return;
                    }

                    if (
                        event.dragEvent.client.y > rect.y &&
                        event.dragEvent.client.y < rect.y + rect.height / 4
                    ) {
                        setMaskPart(MASK_PART.TOP);
                        return;
                    }

                    if (
                        event.dragEvent.client.y >
                            rect.y + (rect.height / 4) * 3 &&
                        event.dragEvent.client.y < rect.y + rect.height
                    ) {
                        setMaskPart(MASK_PART.BOTTOM);
                        return;
                    }
                }
            })
            .on("dragleave", () => {
                setMaskPart(null);
            });
        return () => {
            interactable.unset();
        };
    }, [maskPartContainer, node, setMaskPart]);
    const selectedNode = useMemo(
        () => childNodes.find((node) => node.selected === true),
        [childNodes]
    );

    return (
        <div ref={ref} id={nodeId} className={classes.widget}>
            <Titlebar nodeIds={childNodes.map((child) => child.id)} />
            <div ref={widgetRef} className={classes.panel}>
                <div className={classes[maskPart ? maskPart : "hide"]} />
                {selectedNode ? <Panel nodeId={selectedNode?.id} /> : null}
            </div>
        </div>
    );
};

export default Widget;
