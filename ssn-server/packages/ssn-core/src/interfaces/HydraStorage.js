import fs from 'fs';
import N3 from 'n3';

import { RDF, HYDRA, SOSA } from '../utils/vocs.js';
import isValidDate from '../utils/isValidDate.js';

import PaginationAbstractStorage from './PaginationAbstractStorage.js';
import { PageNotFoundException, InvalidDateException } from '../exceptions/index.js';
import HydraCollection from '../collections/HydraCollection.js';
import stat from '../utils/stat.js';

const { quad } = N3.DataFactory;

class HydraStorage extends PaginationAbstractStorage {
  constructor(observableProperty, communicationManager, collection, options) {
    super(communicationManager, options);

    this.collection = collection || new HydraCollection(observableProperty);
  }

  addObservation(observationStore) {
    const observationQuads = observationStore.getQuads();

    this.remainingObservations -= 1;

    if (this.remainingObservations <= 0) {
      const ISOString = observationStore.getObjects(null, SOSA('resultTime'))[0].value;

      this.createNewPage(ISOString);
    }

    // Add the quads for the Observation
    this.writer.addQuads(observationQuads);

    // Add a hydra:member to the collection
    this.writer.addQuad(
      quad(this.collection.getSubject(), HYDRA('member'), observationQuads[0].subject)
    );

    this.flushWriter();
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

  async getPage({ pageName: originalPageName }) {
    const pageDate = new Date(originalPageName);

    if (!isValidDate(pageDate)) {
      throw new InvalidDateException();
    }

    const pageName = `${this.dataPath}/${pageDate.toISOString()}.ttl`;
    const stats = await stat(pageName);

    return {
      immutable: this.pageName === pageDate.toISOString(),
      body: fs.createReadStream(pageName),
      headers: {
        'Content-Length': stats.size,
        'Last-Modified': stats.mtime
      }
    };
  }

  createNewPage(newPageName) {
    const hasPrevious = this.fileStream !== undefined;

    const newPageNameNamed = this.collection.getSubject(newPageName);

    const { newWriter, newFileStream } = super.createNewPage(newPageName, newPageNameNamed);

    // Adding quads from feature of interest.
    // The feature of interest also contains the collection quads
    newWriter.addQuads(this.collection.observableProperty.featureOfInterest.getQuads());

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

    return newPageName;
  }
}

export default HydraStorage;
