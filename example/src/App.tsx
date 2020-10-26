import React from "react";

import {
    Layout,
    LayoutNode,
    DIRECTION,
    NODE_TYPE,
    ILayoutNode,
    CustomTab as Tab,
    Provider as WidgetLayoutProvider,
} from "widget-layout";

const Test = (props: { title?: string }) => {
    return <div>Test{props.title}</div>;
};

const test: ILayoutNode = {
    id: "root",
    type: NODE_TYPE.LAYOUT_NODE,
    direction: DIRECTION.COLUMN,
    children: [
        {
            id: "A",
            type: NODE_TYPE.WIDGET_NODE,
            children: [
                {
                    id: "A_A",
                    type: NODE_TYPE.PANEL,
                    Page: () => <Test title="A_A" />,
                    Tab: Tab,
                    title: "A_A",
                },
                {
                    id: "A_B",
                    type: NODE_TYPE.PANEL,
                    Page: () => <Test title="A_B" />,
                    Tab: Tab,
                    title: "A_B",
                },
            ],
        },
        {
            id: "B",
            type: NODE_TYPE.LAYOUT_NODE,
            direction: DIRECTION.ROW,
            children: [
                {
                    id: "B_A",
                    type: NODE_TYPE.WIDGET_NODE,
                    children: [
                        {
                            id: "B_A_A",
                            type: NODE_TYPE.PANEL,
                            Page: () => <Test />,
                            Tab: Tab,
                            title: "B_A_A",
                        },
                        {
                            id: "B_A_B",
                            type: NODE_TYPE.PANEL,
                            Page: () => <Test />,
                            Tab: Tab,
                            title: "B_A_B",
                        },
                    ],
                },
                {
                    id: "B_B",
                    type: NODE_TYPE.WIDGET_NODE,
                    children: [
                        {
                            id: "B_B_A",
                            type: NODE_TYPE.PANEL,
                            Page: () => <Test />,
                            Tab: Tab,
                            title: "B_B_A",
                        },
                        {
                            id: "B_B_B",
                            type: NODE_TYPE.PANEL,
                            Page: () => <Test />,
                            Tab: Tab,
                            title: "B_B_B",
                        },
                    ],
                },
            ],
        },
        {
            id: "C",
            type: NODE_TYPE.WIDGET_NODE,
            children: [
                {
                    id: "C_A",
                    type: NODE_TYPE.PANEL,
                    Page: () => <Test />,
                    Tab: Tab,
                    title: "C_A",
                },
                {
                    id: "C_B",
                    type: NODE_TYPE.PANEL,
                    Page: () => <Test />,
                    Tab: Tab,
                    title: "C_B_TEST_TITLE",
                },
            ],
        },
    ],
};

const rootNode = new LayoutNode(test);

console.log(rootNode);

function App() {
    return (
        <div
            className="App"
            style={{ height: 500, width: 500, backgroundColor: "grey" }}
        >
            <WidgetLayoutProvider value={rootNode}>
                <Layout nodeId={rootNode.id} />
            </WidgetLayoutProvider>
        </div>
    );
}

export default App;
