import N3 from 'n3';

import PaginationAbstractStorage from './PaginationAbstractStorage.js';
import { TREE, RDF, VOID } from '../utils/vocs.js';
import { InvalidDateException, PageNotFoundException } from '../exceptions/index.js';

const { namedNode, quad } = N3.DataFactory;

class TreeStorage extends PaginationAbstractStorage {
  constructor(options) {
    super(options);

    this.boot();
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

  getPage(pageName) {
    const pageDate = new Date(pageName);

    // For security reasons
    if (!isValidDate(pageDate)) {
      throw new InvalidDateException();
    }

    if (!fs.existsSync(`${this.dataPath}/${pageDate.toISOString()}.ttl`)) {
      throw new PageNotFoundException();
    }

    // TODO: add relations to the tree

    return {
      immutable: false,
      body: fs.createReadStream(`${this.dataPath}/${pageDate.toISOString()}.ttl`)
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
  }
}

export default TreeStorage;
