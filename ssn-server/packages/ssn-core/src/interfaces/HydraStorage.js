import fs from 'fs';
import N3 from 'n3';

import { RDF, HYDRA } from '../utils/vocs.js';
import isValidDate from '../utils/isValidDate.js';

import PaginationAbstractStorage from './PaginationAbstractStorage.js';
import { PageNotFoundException, InvalidDateException } from '../exceptions/index.js';
import HydraCollection from '../collections/HydraCollection.js';

const { quad } = N3.DataFactory;

class HydraStorage extends PaginationAbstractStorage {
  constructor(observableProperty, communicationManager, options) {
    super(communicationManager, options);

    this.collection = new HydraCollection(observableProperty);

    this.boot();
    this.listen();
  }

  addObservation(observationStore) {
    const observationQuads = observationStore.getQuads();

    // Add the quads for the Observation
    this.writer.addQuads(observationQuads);

    // Add a hydra:member to the collection
    this.writer.addQuad(
      quad(this.collection.getSubject(), HYDRA('member'), observationQuads[0].subject)
    );

    this.remainingObservations -= 1;

    if (this.remainingObservations <= 0) {
      this.createNewPage();
    } else {
      this.flushWriter();
    }
  }

  getIndexPage() {
    return this.getLatestPage();
  }

  getLatestPage() {
    return {
      immutable: false,
      body: fs.createReadStream(`${this.dataPath}/${this.pageName}.ttl`)
    };
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

    return {
      immutable: this.pageName === pageDate.toISOString(),
      body: fs.createReadStream(`${this.dataPath}/${pageDate.toISOString()}.ttl`)
    };
  }

  createNewPage() {
    const hasPrevious = this.fileStream !== undefined;

    const newPageName = new Date().toISOString();
    const newPageNameNamed = this.collection.getSubject(newPageName);

    const { newWriter, newFileStream } = super.createNewPage(newPageName, newPageNameNamed);

    // Adding quads for partial collection
    newWriter.addQuad(quad(this.collection.getSubject(), HYDRA('view'), newPageNameNamed));
    newWriter.addQuad(quad(newPageNameNamed, RDF('type'), HYDRA('PartialCollectionView')));

    if (hasPrevious) {
      // Adding hydra:previous from this new page to the previous page
      newWriter.addQuad(quad(newPageNameNamed, HYDRA('previous'), this.pageNameNamed));

      // Adding hydra:next to the current last page
      this.writer.addQuad(quad(this.pageNameNamed, HYDRA('next'), newPageNameNamed));

      // Closing current streams
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

export default HydraStorage;
