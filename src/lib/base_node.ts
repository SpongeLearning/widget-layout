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
}

export default BaseNode;
