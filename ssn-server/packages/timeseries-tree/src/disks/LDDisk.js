import fs from 'fs';
import N3 from 'n3';
import Disk from './AbstractDisk.js';
import IndexNode from '../IndexNode.js';
import LeafNode from '../LeafNode.js';

const { namedNode, quad, blankNode, literal } = N3.DataFactory;

const TREE = name => {
  return namedNode(`https://w3id.org/tree#${name}`);
};

const RDF = name => {
  return namedNode(`http://www.w3.org/1999/02/22-rdf-syntax-ns#${name}`);
};

const XSD = name => {
  return namedNode(`http://www.w3.org/2001/XMLSchema#${name}`);
};

const convertToNumberIfNumber = string => {
  const x = Number(string);

  return isNaN(x) ? string : x;
};

/**
 * The name for a blank node can contain a colon.
 *
 */
const encode = decoded => {
  return decoded.split(':').join('__colon__');
};
const decode = encoded => {
  return encoded.split('__colon__').join(':');
};

class LDDisk extends Disk {
  constructor(directory, degree, treePath, collectionSubject) {
    super();

    if (!directory) {
      throw new Error('No directory specified');
    }

    if (!degree) {
      throw new Error('No degree specified');
    }

    if (!treePath) {
      throw new Error('No treepath specified');
    }

    if (!collectionSubject) {
      throw new Error('No collectionSubject specified');
    }

    this.directory = directory;
    this.degree = degree;
    this.treePath = treePath;
    this.collectionSubject = collectionSubject;
  }

  _getView(name, withPrefix = true) {
    return namedNode(
      `${this.collectionSubject}${name && withPrefix ? '/node' : ''}${name ? '/' + name : ''}`
    );
  }

  _getTypeAndValueForLeafNode(node, relation, i) {
    const relationBlankNode = blankNode(`leaf_${encode(relation)}`);
    let type, value;

    const isFirstRelation = i === 0 && node.keys.length > 1;
    const isLastRelation = i === node.relations.length - 1 || node.keys.length === 1;

    if (isFirstRelation) {
      type = TREE('LessThanRelation');
      value = literal(node.keys[1], XSD('dateTime'));
    } else if (isLastRelation) {
      type = TREE('GreaterOrEqualThanRelation');
      value = literal(node.keys[node.keys.length - 1], XSD('dateTime'));
    } else {
      type = TREE('InBetweenRelation');
      value = literal(`${node.keys[i]};${node.keys[i + 1]}`);
    }

    return [relationBlankNode, type, value];
  }

  _getTypeAndValueForIndexNode(node, relation, i) {
    const relationBlankNode = blankNode(relation);

    let type, value;

    const isFirstRelation = i === 0;
    const isLastRelation = i === node.relations.length - 1;

    if (isFirstRelation) {
      type = TREE('LessThanRelation');
      value = literal(node.keys[0], XSD('dateTime'));
    } else if (isLastRelation) {
      type = TREE('GreaterOrEqualThanRelation');
      value = literal(node.keys[node.keys.length - 1], XSD('dateTime'));
    } else {
      type = TREE('InBetweenRelation');
      value = literal(`${node.keys[i - 1]};${node.keys[i]}`);
    }

    return [relationBlankNode, type, value];
  }

  _getQuadsForNode(node) {
    const collectionSubject = this._getView();
    const viewSubject = this._getView(node.nodeNumber);

    return [
      quad(collectionSubject, RDF('type'), TREE('Collection')),
      quad(collectionSubject, TREE('view'), viewSubject),
      quad(viewSubject, RDF('type'), TREE('Node')),
      node.relations.map((relation, i) => {
        const [relationBlankNode, type, value] = node.isLeaf()
          ? this._getTypeAndValueForLeafNode(node, relation, i)
          : this._getTypeAndValueForIndexNode(node, relation, i);

        return [
          quad(viewSubject, TREE('Relation'), relationBlankNode),
          quad(relationBlankNode, TREE('node'), this._getView(relation, !node.isLeaf())),
          quad(relationBlankNode, TREE('path'), this.treePath),
          quad(relationBlankNode, RDF('type'), type),
          quad(relationBlankNode, TREE('value'), value)
        ];
      })
    ].flat(Infinity);
  }

  write(node) {
    return new Promise(resolve => {
      const writeStream = fs.createWriteStream(`${this.directory}/${node.nodeNumber}`);

      const writer = new N3.Writer(writeStream);
      writer.addQuads(this._getQuadsForNode(node));
      writer.end(() => resolve());
    });
  }

  read(name) {
    const content = fs.readFileSync(`${this.directory}/${name}`, 'utf-8');

    const parser = new N3.Parser({ blankNodePrefix: '' });
    const store = new N3.Store();

    const keys = [];
    const relations = [];

    store.addQuads(parser.parse(content));

    const nodeSubjects = store.getSubjects(TREE('node'));
    let previousKey;
    let isLeaf = false;

    nodeSubjects.map(nodeSubject => {
      let relation = decode(nodeSubject.value.replace('_:'));

      if (relation.startsWith('leaf_')) {
        relation = relation.replace('leaf_', '');
        isLeaf = true;

        if (previousKey === undefined) {
          keys.push(undefined);
        }
      }

      store
        .getObjects(nodeSubject, TREE('value'))[0]
        .value.split(';')
        .forEach(key => {
          if (previousKey !== key) {
            keys.push(convertToNumberIfNumber(key));
            previousKey = key;
          }
        });

      relations.push(convertToNumberIfNumber(relation));
    });

    const Type = isLeaf ? LeafNode : IndexNode;
    const node = new Type(name, this.degree);

    node.keys = keys;
    node.relations = relations;

    return node;
  }
}

export default LDDisk;
