import { makeStyles } from "@material-ui/styles";
import clsx from "clsx";
import React, { forwardRef } from "react";

import Close from "../svg/Close";

const useStyle = makeStyles({
    root: {
        touchAction: "none",
        backgroundColor: "#00000025",
        display: "flex",
        alignItems: "center",
        borderStyle: "solid",
        borderWidth: "thin",
        margin: "2px",
    },
    close: {
        "&:hover": {
            backgroundColor: "#00000025",
        },
        width: "20px",
        height: "20px",
    },
});

const CustomTab = forwardRef<
    HTMLDivElement,
    {
        nodeId: string;
        nodeTitle: string;
        onClose: () => void;
        onSelect: () => void;
    }
>((props, ref) => {
    const { nodeId, nodeTitle, onClose, onSelect } = props;
    const classes = useStyle();

    return (
        <div id={nodeId} ref={ref} className={clsx("Tab", classes.root)}>
            <div
                style={{ lineHeight: "100%", textAlign: "center" }}
                onClick={onSelect}
            >
                {nodeTitle}
            </div>
            <div className={classes.close} onClick={onClose}>
                <Close />
            </div>
        </div>
    );
});

export default CustomTab;
