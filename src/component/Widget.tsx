import { makeStyles } from "@material-ui/styles";
import interact from "interactjs";
import { uniqueId } from "lodash";
import React, { useEffect, useMemo, useRef } from "react";

import { useChildNodes, useStateContainer } from "../hook";
import {
    DIRECTION,
    findNode,
    LayoutNode,
    MASK_PART,
    NODE_TYPE,
    PanelNode,
    removeNode,
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

    const childNodes = useChildNodes(node) as PanelNode[];

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

                if (maskPartContainer.current === MASK_PART.CENTER) {
                    removeNode(dragNode);
                    dragNode.appendTo(node);
                }

                if (
                    (node.parent?.direction === DIRECTION.ROW ||
                        node.parent?.direction === DIRECTION.ROWREV) &&
                    (maskPartContainer.current === MASK_PART.RIGHT ||
                        maskPartContainer.current === MASK_PART.LEFT)
                ) {
                    let index = node.parent.children.findIndex(
                        (child) => child.id === node.id
                    );
                    if (index !== -1) {
                        const widget = new WidgetNode(
                            {
                                id: uniqueId(),
                                type: NODE_TYPE.WIDGET_NODE,
                                children: [],
                            },
                            node.root
                        );
                        removeNode(dragNode);
                        dragNode.appendTo(widget);
                        index =
                            maskPartContainer.current === MASK_PART.LEFT
                                ? index
                                : index + 1;
                        widget.appendTo(node.parent, index);
                    }
                }

                if (
                    (node.parent?.direction === DIRECTION.COLUMN ||
                        node.parent?.direction === DIRECTION.COLUMNREV) &&
                    (maskPartContainer.current === MASK_PART.BOTTOM ||
                        maskPartContainer.current === MASK_PART.TOP)
                ) {
                    let index = node.parent.children.findIndex(
                        (child) => child.id === node.id
                    );
                    if (index !== -1) {
                        const widget = new WidgetNode(
                            {
                                id: uniqueId(),
                                type: NODE_TYPE.WIDGET_NODE,
                                children: [],
                            },
                            node.root
                        );
                        removeNode(dragNode);
                        dragNode.appendTo(widget);
                        index =
                            maskPartContainer.current === MASK_PART.TOP
                                ? index
                                : index + 1;
                        widget.appendTo(node.parent, index);
                    }
                }

                if (
                    (node.parent?.direction === DIRECTION.ROW ||
                        node.parent?.direction === DIRECTION.ROWREV) &&
                    (maskPartContainer.current === MASK_PART.BOTTOM ||
                        maskPartContainer.current === MASK_PART.TOP)
                ) {
                    const layout = new LayoutNode(
                        {
                            id: uniqueId(),
                            type: NODE_TYPE.LAYOUT_NODE,
                            direction: DIRECTION.COLUMN,
                            children: [],
                        },
                        node.root
                    );

                    const widget = new WidgetNode(
                        {
                            id: uniqueId(),
                            type: NODE_TYPE.WIDGET_NODE,
                            children: [],
                        },
                        node.root
                    );

                    node.parent.replaceNode(node, layout);

                    removeNode(dragNode);
                    dragNode.appendTo(widget);

                    node.appendTo(layout);

                    maskPartContainer.current === MASK_PART.TOP
                        ? widget.appendTo(layout, 0)
                        : widget.appendTo(layout);
                }

                if (
                    (node.parent?.direction === DIRECTION.COLUMN ||
                        node.parent?.direction === DIRECTION.COLUMNREV) &&
                    (maskPartContainer.current === MASK_PART.RIGHT ||
                        maskPartContainer.current === MASK_PART.LEFT)
                ) {
                    const layout = new LayoutNode(
                        {
                            id: uniqueId(),
                            type: NODE_TYPE.LAYOUT_NODE,
                            direction: DIRECTION.ROW,
                            children: [],
                        },
                        node.root
                    );

                    const widget = new WidgetNode(
                        {
                            id: uniqueId(),
                            type: NODE_TYPE.WIDGET_NODE,
                            children: [],
                        },
                        node.root
                    );

                    node.parent.replaceNode(node, layout);

                    removeNode(dragNode);
                    dragNode.appendTo(widget);

                    node.appendTo(layout);

                    maskPartContainer.current === MASK_PART.LEFT
                        ? widget.appendTo(layout, 0)
                        : widget.appendTo(layout);
                }

                setMaskPart(null);
                node.root.update();
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
        <div ref={ref} id={node.id} className={classes.widget}>
            <Titlebar nodeIds={childNodes.map((child) => child.id)} />
            <div ref={widgetRef} className={classes.panel}>
                <div className={classes[maskPart ? maskPart : "hide"]} />
                {selectedNode ? <Panel nodeId={selectedNode?.id} /> : null}
            </div>
        </div>
    );
};

export default Widget;
