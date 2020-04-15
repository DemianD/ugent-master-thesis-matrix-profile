import fs from 'fs';
import N3 from 'n3';
import createTree from 'functional-red-black-tree';
import { PassThrough } from 'stream';

import PaginationAbstractStorage from './PaginationAbstractStorage.js';
import { TREE, RDF, VOID, SOSA, XSD } from '../utils/vocs.js';
import { InvalidDateException, PageNotFoundException } from '../exceptions/index.js';
import isValidDate from '../utils/isValidDate.js';
import stringifyQuads from '../utils/stringifyQuads.js';
import TreeCollection from '../collections/TreeCollection.js';

const { quad, blankNode, literal } = N3.DataFactory;

class TreeStorage extends PaginationAbstractStorage {
  constructor(observableProperty, communicationManager, options) {
    super(communicationManager, options);

    this.tree = createTree();
    this.collection = new TreeCollection(observableProperty);

    this.boot(communicationManager);

    // Prevents inserting the first page twice
    if (this.pages.length > 1) {
      this.pages.forEach(fileName => {
        this.tree = this.tree.insert(fileName);
      });
    }

    this.listen();
  }

  addObservation(observationStore) {
    const observationQuads = observationStore.getQuads();

    // Add the quads for the Observation
    this.writer.addQuads(observationQuads);

    // Add a tree:member to the collection
    this.writer.addQuad(
      quad(this.collection.getSubject(), TREE('member'), observationQuads[0].subject)
    );

    this.remainingObservations -= 1;

    if (this.remainingObservations <= 0) {
      this.createNewPage();
    } else {
      this.flushWriter();
    }
  }

  getIndexPage() {
    return this.getPage({ pageName: this.tree.root.key });
  }

  getLatestPage() {
    return this.getPage({ pageName: this.pageName });
  }

  getPage({ pageName: originalPageName }) {
    const pageDate = new Date(originalPageName);

    // For security reasons
    if (!isValidDate(pageDate)) {
      throw new InvalidDateException();
    }

    const pageName = pageDate.toISOString();

    const it = this.tree.find(pageName);

    if (it === null || it.node === null) {
      throw new PageNotFoundException();
    }

    const resultStream = new PassThrough();

    const fileStream = fs.createReadStream(`${this.dataPath}/${pageName}.ttl`, 'utf-8');
    fileStream.pipe(resultStream);

    const leftNode = it.node.left;
    const rightNode = it.node.right;

    if (leftNode) {
      const leftBlankNode = blankNode('tree-left');

      resultStream.push(
        stringifyQuads([
          quad(this.collection.getSubject(pageName), TREE('relation'), leftBlankNode),
          quad(leftBlankNode, RDF('type'), TREE('LessThanRelation')),
          quad(leftBlankNode, TREE('node'), this.collection.getSubject(leftNode.key)),
          quad(leftBlankNode, TREE('path'), SOSA('resultTime')),
          quad(leftBlankNode, TREE('value'), literal(pageName, XSD('dateTime')))
        ])
      );
    }

    if (rightNode) {
      const rightBlankNode = blankNode('tree-right');

      // If it has a right node, it has definitly a successor
      // This successor contains the first observation of the next page
      it.next();

      resultStream.push(
        stringifyQuads([
          quad(this.collection.getSubject(pageName), TREE('relation'), rightBlankNode),
          quad(rightBlankNode, RDF('type'), TREE('GreaterOrEqualThanRelation')),
          quad(rightBlankNode, TREE('node'), this.collection.getSubject(rightNode.key)),
          quad(rightBlankNode, TREE('path'), SOSA('resultTime')),
          quad(rightBlankNode, TREE('value'), literal(it.node.key, XSD('dateTime')))
        ])
      );
    }

    return {
      immutable: false,
      body: resultStream
    };
  }

  createNewPage() {
    const hasPrevious = this.fileStream !== undefined;

    const newPageName = new Date().toISOString();
    const newPageNameNamed = this.collection.getSubject(newPageName);

    const { newWriter, newFileStream } = super.createNewPage(newPageName, newPageNameNamed);

    // TODO: on the root page, it's not a subset.
    newWriter.addQuad(quad(this.collection.getSubject(), VOID('subset'), newPageNameNamed));

    // Adding quads for partial collection
    // We don't define the relations here so we can make the tree balanced
    newWriter.addQuad(quad(newPageNameNamed, RDF('type'), TREE('node')));

    if (hasPrevious) {
      this.writer.end();
      this.fileStream.end();
    }

    this.fileStream = newFileStream;
    this.writer = newWriter;

    this.pageName = newPageName;
    this.pageNameNamed = newPageNameNamed;

    this.flushWriter();

    this.tree = this.tree.insert(newPageName);
  }
}

export default TreeStorage;
