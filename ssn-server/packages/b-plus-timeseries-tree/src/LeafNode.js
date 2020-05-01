import Node from './Node.js';

class LeafNode extends Node {
  constructor(nodeNumber, degree) {
    super(nodeNumber, degree);
  }

  isLeaf() {
    return true;
  }

  /**
   * Moves the rightmost part to the new brother node
   * Keeps the middle element
   */
  splitTo(brotherNode) {
    const middleIndex = Math.floor(this.keys.length / 2);
    const middleElement = this.keys[middleIndex];

    for (let i = middleIndex + 1; i < this.keys.length; i++) {
      brotherNode.insert(this.keys[i], this.relations[i]);
    }

    this.keys.length = middleIndex + 1;
    this.relations.length = middleIndex + 1;

    return middleElement;
  }
}

export default LeafNode;
