import Node from './Node.js';

class IndexNode extends Node {
  constructor(nodeNumber, degree, firstElement, leftNode, rightNode) {
    super(nodeNumber, degree);

    if (firstElement) {
      if (!leftNode || !rightNode) {
        throw new Error(
          'When creating a new indexNode with a first element, both leftNode and rightNode should be present'
        );
      }

      this.keys.push(firstElement);

      this.relations[0] = leftNode instanceof Node ? leftNode.nodeNumber : leftNode;
      this.relations[1] = rightNode instanceof Node ? rightNode.nodeNumber : rightNode;
    }
  }

  insert(key, nodeOrNodeNumber) {
    super.insert(
      key,
      nodeOrNodeNumber instanceof Node ? nodeOrNodeNumber.nodeNumber : nodeOrNodeNumber
    );
  }

  isLeaf() {
    return false;
  }

  splitTo(brotherNode) {
    const middleIndex = Math.floor(this.keys.length / 2);
    const relationElement = this.keys[middleIndex];

    for (let i = middleIndex + 1; i < this.keys.length; i++) {
      brotherNode.insert(this.keys[i], this.relations[i]);
    }

    brotherNode.relations.push(this.relations[this.relations.length - 1]);

    this.keys.length = middleIndex;
    this.relations.length = middleIndex + 1;

    return relationElement;
  }
}

export default IndexNode;
