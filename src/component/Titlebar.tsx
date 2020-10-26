import { makeStyles } from "@material-ui/styles";
import React, { useCallback, useEffect, useState } from "react";

import Tab from "./Tab";

const useStyle = makeStyles({
    titlebar: {
        height: "25px",
        display: "flex",
    },
});

const Titlebar = (props: { nodeIds: string[] }) => {
    const { nodeIds } = props;
    const [selected, setSelected] = useState("");
    const classes = useStyle();
    useEffect(() => {
        if (!nodeIds.includes(selected)) {
            setSelected(nodeIds[0]);
        }
    }, [nodeIds, selected]);
    const onSelect = useCallback((nodeId: string) => {
        setSelected(nodeId);
    }, []);
    return (
        <div className={classes.titlebar}>
            {nodeIds.map((id) => (
                <Tab
                    key={id}
                    nodeId={id}
                    selected={selected}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
};

export default Titlebar;
