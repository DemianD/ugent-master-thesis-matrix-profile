import Node from './Node.js';

class LeafNode extends Node {
  constructor(nodeNumber, degree) {
    super(nodeNumber, degree);
  }

  containLeaves() {
    return true;
  }

  splitTo(brotherNode) {
    const middleIndex = Math.floor(this.keys.length / 2);
    const relationElement = this.keys[middleIndex + 1];

    for (let i = middleIndex + 1; i < this.keys.length; i++) {
      brotherNode.insert(this.keys[i], this.relations[i]);
    }

    this.keys.length = middleIndex + 1;
    this.relations.length = middleIndex + 1;

    return relationElement;
  }
}

export default LeafNode;
