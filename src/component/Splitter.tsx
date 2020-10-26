import { makeStyles } from "@material-ui/styles";
import interact from "interactjs";
import lodash from "lodash";
import React, { useEffect, useRef, useState } from "react";

import { DIRECTION, LayoutNode, Node, useNode, WidgetNode } from "../lib";

const useStyle = makeStyles({
    splitter: (props: {
        parent: LayoutNode;
        primary: Node;
        secondary: Node;
        movingOffset: number;
        dragging: boolean;
    }) => {
        const { parent, dragging } = props;
        const hoverBackgroundColor = "#00000085";
        return {
            width:
                parent.direction === DIRECTION.ROW ||
                parent.direction === DIRECTION.ROWREV
                    ? 10
                    : "100%",
            height:
                parent?.direction === DIRECTION.ROW ||
                parent?.direction === DIRECTION.ROWREV
                    ? "100%"
                    : 10,
            backgroundColor: dragging ? hoverBackgroundColor : "#00000065",
            touchAction: "none",
        };
    },
    shadow: (props: {
        parent: LayoutNode;
        primary: Node;
        secondary: Node;
        movingOffset: number;
        dragging: boolean;
    }) => {
        const { parent, primary, secondary, movingOffset, dragging } = props;
        let x =
            parent.direction === DIRECTION.ROW ||
            parent.direction === DIRECTION.ROWREV
                ? movingOffset
                : 0;
        let y =
            parent.direction === DIRECTION.ROW ||
            parent.direction === DIRECTION.ROWREV
                ? 0
                : movingOffset;
        if (
            parent.direction === DIRECTION.ROW ||
            parent.direction === DIRECTION.ROWREV
        ) {
            if (x < -primary.width) {
                x = -primary.width;
            }
            if (x > secondary.width) {
                x = secondary.width;
            }
        } else {
            if (y < -primary.height) {
                y = -primary.height;
            }
            if (y > secondary.height) {
                y = secondary.height;
            }
        }
        const transform = `translate(${x}px, ${y}px)`;
        return {
            display: dragging ? undefined : "none",
            position: "relative",
            zIndex: 1,
            transform,
            width: "100%",
            height: "100%",
            backgroundColor: "#00000065",
        };
    },
});

const Splitter = (props: {
    parentId: string;
    primaryId: string;
    secondaryId: string;
    inTime: boolean;
}) => {
    const { parentId, primaryId, secondaryId, inTime } = props;
    const [dragging, setDragging] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const shadowRef = useRef<HTMLDivElement>(null);

    const parent = useNode(parentId) as LayoutNode;
    const primary = useNode(primaryId) as LayoutNode | WidgetNode;
    const secondary = useNode(secondaryId) as LayoutNode | WidgetNode;
    const [movingOffset, setMovingOffset] = useState(0);

    useEffect(() => {
        let primaryOffset = 0;
        let secondaryOffset = 0;
        let offset = 0;
        const interactable = interact(ref.current!).draggable({
            onstart: () => {
                primaryOffset = primary.offset;
                secondaryOffset = secondary.offset;
                setDragging(true);
            },
            onmove: lodash.throttle((event) => {
                offset =
                    parent.direction === DIRECTION.ROW ||
                    parent.direction === DIRECTION.ROWREV
                        ? event.client.x - event.clientX0
                        : event.client.y - event.clientY0;
                if (ref.current != null && shadowRef.current != null) {
                    const splitterRect = ref.current.getBoundingClientRect();
                    if (inTime) {
                        if (
                            parent.direction === DIRECTION.ROW ||
                            parent.direction === DIRECTION.ROWREV
                        ) {
                            if (
                                (event.velocityX < 0 &&
                                    primary.width > 100 &&
                                    event.client.x <=
                                        splitterRect.left +
                                            splitterRect.width / 2) ||
                                (event.velocityX > 0 &&
                                    secondary.width > 100 &&
                                    event.client.x >=
                                        splitterRect.left +
                                            splitterRect.width / 2)
                            ) {
                                primary.offset = primaryOffset + offset;
                                secondary.offset = secondaryOffset - offset;
                            }
                        } else {
                            if (
                                (event.velocityY < 0 &&
                                    primary.height > 100 &&
                                    event.client.y <=
                                        splitterRect.top +
                                            splitterRect.height / 2) ||
                                (event.velocityY > 0 &&
                                    secondary.height > 100 &&
                                    event.client.y >=
                                        splitterRect.top +
                                            splitterRect.height / 2)
                            ) {
                                primary.offset = primaryOffset + offset;
                                secondary.offset = secondaryOffset - offset;
                            }
                        }
                        requestAnimationFrame(() => parent.update());
                    } else {
                        let velocity = 0;
                        let primaryValue = 0;
                        let secondaryValue = 0;
                        if (
                            parent.direction === DIRECTION.ROW ||
                            parent.direction === DIRECTION.ROWREV
                        ) {
                            primaryValue = primary.width;
                            secondaryValue = secondary.width;
                            velocity = event.velocityX;
                        } else {
                            primaryValue = primary.height;
                            secondaryValue = secondary.height;
                            velocity = event.velocityY;
                        }

                        if (velocity >= 0 && secondaryValue - offset < 100) {
                            offset = secondaryValue - 100;
                        }

                        if (velocity <= 0 && primaryValue + offset < 100) {
                            offset = -(primaryValue - 100);
                        }

                        if (velocity >= 0 && primaryValue + offset < 100) {
                            offset = -(primaryValue - 100);
                        }

                        if (velocity <= 0 && secondaryValue - offset < 100) {
                            offset = secondaryValue - 100;
                        }

                        setMovingOffset(offset);
                    }
                }
            }, 16),
            onend: () => {
                setDragging(false);
                if (!inTime) {
                    setMovingOffset(0);
                    primary.offset = primaryOffset + offset;
                    secondary.offset = secondaryOffset - offset;
                    parent.update();
                }
            },
            cursorChecker: () => {
                return parent.direction === DIRECTION.ROW ||
                    parent.direction === DIRECTION.ROWREV
                    ? "ew-resize"
                    : "ns-resize";
            },
            lockAxis:
                parent.direction === DIRECTION.ROW ||
                parent.direction === DIRECTION.ROWREV
                    ? "x"
                    : "y",
        });
        return () => {
            interactable.unset();
        };
    }, [primary, parent, secondary, inTime]);

    const classes = useStyle({
        parent,
        primary,
        secondary,
        dragging,
        movingOffset,
    });

    return (
        <div ref={ref} className={classes.splitter}>
            <div ref={shadowRef} className={classes.shadow}></div>
        </div>
    );
};

export default Splitter;
