import { EventEmitter } from "events";

import Node from "./node";
import { NODE_EVENT, NODE_TYPE } from "./type";

export class BaseNode extends EventEmitter {
    id: string;
    type: NODE_TYPE;
    root?: Node;
    parent?: Node;
    constructor(id: string, type: NODE_TYPE) {
        super();
        this.id = id;
        this.type = type;
    }

    update() {
        this.emit(NODE_EVENT.UPDATE);
    }

    appendTo(node: Node, position?: number, deleteNode = false) {
        this.parent = node;
        node.addNode(this, position, deleteNode);
    }
}

export default BaseNode;
