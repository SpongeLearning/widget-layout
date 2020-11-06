import { makeStyles } from "@material-ui/styles";
import interact from "interactjs";
import lodash from "lodash";
import React, { useEffect, useRef, useState } from "react";

import { DIRECTION, LayoutNode, useNode, WidgetNode } from "../lib";

const useStyle = makeStyles({
    splitter: (props: {
        parentDirection: DIRECTION | undefined;
        movingOffset: number;
        dragging: boolean;
    }) => {
        const { parentDirection, dragging } = props;
        const hoverBackgroundColor = "#00000085";
        return {
            width:
                parentDirection === DIRECTION.ROW ||
                parentDirection === DIRECTION.ROWREV
                    ? 10
                    : "100%",
            height:
                parentDirection === DIRECTION.ROW ||
                parentDirection === DIRECTION.ROWREV
                    ? "100%"
                    : 10,
            backgroundColor: dragging ? hoverBackgroundColor : "#00000065",
            touchAction: "none",
        };
    },
    shadow: (props: {
        parentDirection: DIRECTION | undefined;
        movingOffset: number;
        dragging: boolean;
    }) => {
        const { parentDirection, movingOffset, dragging } = props;
        let x =
            parentDirection === DIRECTION.ROW ||
            parentDirection === DIRECTION.ROWREV
                ? movingOffset
                : 0;
        let y =
            parentDirection === DIRECTION.ROW ||
            parentDirection === DIRECTION.ROWREV
                ? 0
                : movingOffset;
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
}) => {
    const { parentId, primaryId, secondaryId } = props;
    const [dragging, setDragging] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const shadowRef = useRef<HTMLDivElement>(null);

    const parent = useNode(parentId) as LayoutNode;
    const parentDirection = parent.direction;
    const primary = useNode(primaryId) as LayoutNode | WidgetNode;
    const secondary = useNode(secondaryId) as LayoutNode | WidgetNode;
    const [movingOffset, setMovingOffset] = useState(0);

    useEffect(() => {
        let offset = 0;
        const interactable = interact(ref.current!).draggable({
            onstart: () => {
                setDragging(true);
            },
            onmove: lodash.throttle((event) => {
                offset =
                    parent.direction === DIRECTION.ROW ||
                    parent.direction === DIRECTION.ROWREV
                        ? event.client.x - event.clientX0
                        : event.client.y - event.clientY0;
                if (ref.current != null && shadowRef.current != null) {
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
            }, 16),
            onend: () => {
                setDragging(false);
                setMovingOffset(0);
                primary.offset = primary.offset + offset;
                secondary.offset = secondary.offset - offset;
                parent.update();
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
    }, [primary, parent, secondary]);

    const classes = useStyle({
        parentDirection,
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
