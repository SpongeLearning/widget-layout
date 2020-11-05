import BaseNode from "./base_node";
import { shakeTree } from "./utils";

class Node extends BaseNode {
    children: BaseNode[] = [];
    offset = 0;
    height = 0;
    width = 0;

    update() {
        if (shakeTree(this)) {
            this.root?.update();
        } else {
            super.update();
            this.children.forEach((child) => {
                child.update();
            });
        }
    }
}

export default Node;
