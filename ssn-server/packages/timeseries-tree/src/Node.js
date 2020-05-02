class Node {
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

export default Node;
