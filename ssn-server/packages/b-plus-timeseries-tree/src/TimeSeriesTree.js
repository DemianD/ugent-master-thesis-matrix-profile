const defaultNodeNamer = () => {
  let i = 1;

  return () => i++;
};

export class Node {
  constructor(nodeNumber, degree) {
    this.nodeNumber = nodeNumber;
    this.degree = degree;

    this.keys = [];
    this.relations = [];
  }

  isFull() {
    return this.keys.length === this.degree;
  }

  isLeaf() {
    throw new Error('Not implemented');
  }

  insert(key, relation) {
    if (key === undefined || relation === undefined) {
      throw new Error("Can't insert a key or relation that is undefined");
    }

    this.keys.push(key);
    this.relations.push(relation);
  }

  getLastRelation() {
    return this.relations[this.relations.length - 1];
  }
}

export class LeafNode extends Node {
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

export class IndexNode extends Node {
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

  /**
   * Moves the rightmost part to the new brother node
   * Returns the middle element
   */
  splitTo(brotherNode) {
    const middleIndex = Math.floor(this.keys.length / 2);
    const middleElement = this.keys[middleIndex];

    for (let i = middleIndex + 1; i < this.keys.length; i++) {
      brotherNode.insert(this.keys[i], this.relations[i]);
    }

    brotherNode.relations.push(this.relations[this.relations.length - 1]);

    this.keys.length = middleIndex;
    this.relations.length = middleIndex + 1;

    return middleElement;
  }
}

export class TimeSeriesTree {
  constructor(disk, degree, nodeNamer = defaultNodeNamer()) {
    this.disk = disk;
    this.degree = degree;
    this.nodeNamer = nodeNamer;

    const root = disk.read('root');

    if (root === undefined) {
      this.path = [new LeafNode('root', this.degree)];
    } else {
      this.path = [root];

      const current = root;
      let nextRelation = current.getLastRelation();

      while (nextRelation) {
        const nextNode = disk.read(nextRelation);

        if (!nextNode) {
          throw new Error(`Could not resture the tree. Node ${nextRelation} not found`);
        }

        this.path.push(nextNode);
        nextRelation = nextNode.getLastRelation();
      }
    }
  }

  get mostRightIndexNode() {
    return this.path[this.path.length - 1];
  }

  /**
   * We only add a new fragment to the most right index node
   */
  async insert(key, value) {
    this.mostRightIndexNode.insert(key, value);

    if (!this.mostRightIndexNode.isFull()) {
      await this.disk.write(this.mostRightIndexNode);

      return;
    }

    let currentNode = this.mostRightIndexNode;
    let parentIndex = this.path.length - 1 - 1;

    while (currentNode.isFull()) {
      const brotherNode = currentNode.isLeaf()
        ? new LeafNode(this.nodeNamer(), this.degree)
        : new IndexNode(this.nodeNamer(), this.degree);

      const middleElement = currentNode.splitTo(brotherNode);

      this.path[parentIndex + 1] = brotherNode;

      const isRoot = parentIndex === -1;

      if (isRoot) {
        currentNode.nodeNumber = this.nodeNamer();

        const newRoot = new IndexNode('root', this.degree, middleElement, currentNode, brotherNode);

        await Promise.all([this.disk.write(brotherNode), this.disk.write(currentNode)]);

        this.path.unshift(newRoot);
        currentNode = newRoot;
      } else {
        await Promise.all([this.disk.write(brotherNode), this.disk.write(currentNode)]);

        this.path[parentIndex].insert(middleElement, brotherNode);
        currentNode = this.path[parentIndex];
        parentIndex--;
      }
    }

    this.disk.write(currentNode);
  }
}

export default TimeSeriesTree;
