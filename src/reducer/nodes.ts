import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";

import { NODE_TYPE } from "../lib";

export interface INode {
    id: string;
    type: NODE_TYPE;

    offset?: number;
    height?: number;
    width?: number;
    children?: string[];
}

export const adapter = createEntityAdapter<INode>({
    selectId: (n) => n.id,
});

const slice = createSlice({
    name: "nodes",
    initialState: adapter.getInitialState(),
    reducers: {
        addMany: adapter.addMany,
    },
});

export default slice.reducer;

export const { addMany } = slice.actions;

export type NodeState = ReturnType<typeof slice.reducer>;

export const { selectById, selectAll } = adapter.getSelectors();
