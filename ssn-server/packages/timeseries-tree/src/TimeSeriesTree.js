import LeafNode from './LeafNode.js';
import IndexNode from './IndexNode.js';

const defaultNodeNamer = () => {
  let i = 1;

  return () => i++;
};

class TimeSeriesTree {
  constructor(disk, degree, nodeNamer = defaultNodeNamer()) {
    this.disk = disk;
    this.degree = degree;
    this.nodeNamer = nodeNamer;

    this.path = [];

    this.load();
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

  load() {
    try {
      this.path.push(this.disk.read('root'));
    } catch {
      this.path.push(new LeafNode('root', this.degree));
    }

    let nextRelation = this.path[0].getLastRelation();

    while (nextRelation) {
      const nextNode = this.disk.read(nextRelation);

      this.path.push(nextNode);
      nextRelation = nextNode.isLeaf() ? undefined : nextNode.getLastRelation();
    }
  }
}

export default TimeSeriesTree;
