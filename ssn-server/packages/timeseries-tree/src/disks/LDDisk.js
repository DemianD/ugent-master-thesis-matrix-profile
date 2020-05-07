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
 * The name for a blank node can contain a colon (because of ISO-string)
 * We fix this by providing some encode/decode functions
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

  _getQuadsForRelation(node, viewSubject, i) {
    const relation = node.relations[i];
    const containLeaves = node.containLeaves();

    const relationBlankNode = blankNode(`${containLeaves ? 'leaf_' : ''}${encode(relation)}`);

    const q = (blankNode, ...quads) => [
      quad(viewSubject, TREE('Relation'), blankNode),
      quad(blankNode, TREE('node'), this._getView(relation, !node.containLeaves())),
      quad(blankNode, TREE('path'), this.treePath),
      ...quads
    ];

    if (containLeaves && node.keys.length === 1) {
      return q(
        relationBlankNode,
        quad(relationBlankNode, RDF('type'), TREE('GreaterOrEqualThanRelation')),
        quad(relationBlankNode, TREE('value'), literal(node.keys[0], XSD('dateTime')))
      );
    }

    const keys = containLeaves ? node.keys.slice(1) : node.keys;

    const isFirstRelation = i === 0;
    const isLastRelation = i === node.relations.length - 1;

    if (isFirstRelation) {
      return q(
        relationBlankNode,
        quad(relationBlankNode, RDF('type'), TREE('LessThanRelation')),
        quad(relationBlankNode, TREE('value'), literal(keys[0], XSD('dateTime')))
      );
    }

    if (isLastRelation) {
      return q(
        relationBlankNode,
        quad(relationBlankNode, RDF('type'), TREE('GreaterOrEqualThanRelation')),
        quad(relationBlankNode, TREE('value'), literal(keys[keys.length - 1], XSD('dateTime')))
      );
    }

    const relationBlankNode1 = relationBlankNode;
    const relationBlankNode2 = blankNode(`${containLeaves ? 'leaf_' : ''}2_${encode(relation)}`);

    const quads = q(
      relationBlankNode2,
      quad(relationBlankNode2, RDF('type'), TREE('LessThanRelation')),
      quad(relationBlankNode2, TREE('value'), literal(keys[i], XSD('dateTime')))
    );

    return q(
      relationBlankNode1,
      quad(relationBlankNode1, RDF('type'), TREE('GreaterOrEqualThanRelation')),
      quad(relationBlankNode1, TREE('value'), literal(keys[i - 1], XSD('dateTime'))),
      ...quads
    );
  }

  _getQuadsForNode(node) {
    const collectionSubject = this._getView();
    const viewSubject = this._getView(node.nodeNumber);

    return [
      quad(collectionSubject, RDF('type'), TREE('Collection')),
      quad(collectionSubject, TREE('view'), viewSubject),
      quad(viewSubject, RDF('type'), TREE('Node')),
      node.relations.map((_, i) => {
        return this._getQuadsForRelation(node, viewSubject, i);
      })
    ].flat(Infinity);
  }

  write(node) {
    return new Promise(resolve => {
      const writeStream = fs.createWriteStream(`${this.directory}/${node.nodeNumber}`);

      const writer = new N3.Writer(writeStream);
      writer.addQuads(this._getQuadsForNode(node));
      writer.end(() => writeStream.close());

      writeStream.once('close', () => {
        resolve();
        this.emit('write', node);
      });
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
    let previousRelation;

    let containLeaves = false;

    nodeSubjects.map(nodeSubject => {
      let relation = decode(nodeSubject.value.replace('_:'));

      if (relation.startsWith('leaf_')) {
        relation = relation.replace('leaf_2_', '');
        relation = relation.replace('leaf_', '');
        containLeaves = true;

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

      if (previousRelation !== relation) {
        relations.push(relation);
        previousRelation = relation;
      }
    });

    const Type = containLeaves ? LeafNode : IndexNode;
    const node = new Type(name, this.degree);

    node.keys = keys;
    node.relations = relations;

    return node;
  }
}

export default LDDisk;
