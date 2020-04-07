import fs from 'fs';
import N3 from 'n3';

import PaginationAbstractStorage from './PaginationAbstractStorage.js';
import { RDF, HYDRA } from '../utils/vocs.js';
import isValidDate from '../utils/isValidDate.js';
import { PageNotFoundException, InvalidDateException } from '../exceptions/index.js';

const { quad } = N3.DataFactory;

class HydraPreviousNextStorage extends PaginationAbstractStorage {
  constructor(communicationManager, options) {
    super(options);

    this.boot(communicationManager);
  }

  addObservation(observationStore) {
    const observationQuads = observationStore.getQuads();

    // Add the quads for the Observation
    this.writer.addQuads(observationQuads);

    // Add a hydra:member to the collection
    this.writer.addQuad(
      quad(this.getCollectionSubject(), HYDRA('member'), observationQuads[0].subject)
    );

    this.remainingObservations -= 1;

    if (this.remainingObservations <= 0) {
      this.createNewPage();
    } else {
      this.flushWriter();
    }
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
    const newPageNameNamed = this.getCollectionSubject(newPageName);

    const { newWriter, newFileStream } = super.createNewPage(newPageName, newPageNameNamed);

    // Addings quads for collection
    newWriter.addQuad(quad(this.getCollectionSubject(), RDF('type'), HYDRA('collection')));
    newWriter.addQuad(quad(this.getCollectionSubject(), HYDRA('view'), newPageNameNamed));

    // Adding quads for partial collection
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

export default HydraPreviousNextStorage;
