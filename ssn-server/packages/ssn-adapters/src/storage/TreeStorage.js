import fs from 'fs';
import N3 from 'n3';
import createTree from 'functional-red-black-tree';
import { PassThrough } from 'stream';

import PaginationAbstractStorage from './PaginationAbstractStorage.js';
import { TREE, RDF, VOID, SOSA, XSD } from '../utils/vocs.js';
import { InvalidDateException, PageNotFoundException } from '../exceptions/index.js';
import isValidDate from '../utils/isValidDate.js';
import stringifyQuads from '../utils/stringifyQuads.js';

const { namedNode, quad, blankNode, literal } = N3.DataFactory;

class TreeStorage extends PaginationAbstractStorage {
  constructor(options) {
    super(options);

    this.tree = createTree();

    this.boot();

    this.pages.forEach(fileName => {
      this.tree = this.tree.insert(fileName);
    });
  }

  addObservation(observationQuads) {
    // Add the quads for the Observation
    this.writer.addQuads(observationQuads);

    // Add a hydra:member to the collection
    this.writer.addQuad(
      quad(this.getCollectionSubject(), TREE('member'), observationQuads[0].subject)
    );

    this.remainingObservations -= 1;

    if (this.remainingObservations == 0) {
      this.createNewPage();
    } else {
      this.flushWriter();
    }
  }

  getPage(originalPageName) {
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
          quad(this.getCollectionSubject(pageName), TREE('relation'), leftBlankNode),
          quad(leftBlankNode, RDF('type'), TREE('LessThanRelation')),
          quad(leftBlankNode, TREE('node'), this.getCollectionSubject(leftNode.key)),
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
          quad(this.getCollectionSubject(pageName), TREE('relation'), rightBlankNode),
          quad(rightBlankNode, RDF('type'), TREE('GreaterOrEqualThanRelation')),
          quad(rightBlankNode, TREE('node'), this.getCollectionSubject(rightNode.key)),
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
    const newPageNameNamed = this.getCollectionSubject(newPageName);

    const { newWriter, newFileStream } = super.createNewPage(newPageName, newPageNameNamed);

    // Addings quads for collection
    newWriter.addQuad(quad(this.getCollectionSubject(), RDF('type'), TREE('collection')));
    newWriter.addQuad(quad(this.getCollectionSubject(), VOID('subset'), newPageNameNamed));

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
