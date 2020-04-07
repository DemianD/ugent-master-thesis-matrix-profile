import fs from 'fs';
import N3 from 'n3';

import AbstractStorage from './AbstractStorage.js';

import createDirectoryIfNotExists from '../utils/createDirectoryIfNotExistsSync.js';
import readDirectorySync from '../utils/readDirectorySync.js';
import { SOSA } from '../utils/vocs.js';
import getRelativeURI from '../utils/getRelativeURI.js';

const { namedNode, quad } = N3.DataFactory;

class PaginationAbstractStorage extends AbstractStorage {
  constructor({ observableProperty, dataPath, observationsPerPage }) {
    super();

    this.observableProperty = observableProperty;

    this.dataPath = dataPath;
    this.observationsPerPage = observationsPerPage;
  }

  boot(communicationManager) {
    // Create directory if it does not exists
    createDirectoryIfNotExists(this.dataPath);

    // On boot, find the latest file based on folder name
    this.pages = readDirectorySync(this.dataPath, '.ttl').map(file => file.replace('.ttl', ''));

    // If there were no files, create a new page
    if (this.pages.length === 0) {
      this.createNewPage();
      return;
    }

    this.pageName = this.pages[this.pages.length - 1];
    this.pageNameNamed = this.getCollectionSubject(this.pageName);

    // Count how many observations there are in the file
    const content = fs.readFileSync(`${this.dataPath}/${this.pageName}.ttl`, 'utf-8');

    const numberOfObservations = content.split(SOSA('Observation').value).length - 1;
    this.remainingObservations = this.observationsPerPage - numberOfObservations;

    // Create the streams
    this.fileStream = fs.createWriteStream(`${this.dataPath}/${this.pageName}.ttl`, {
      flags: 'a'
    });

    this.writer = new N3.Writer(this.fileStream, {
      end: false
    });

    this.registerEndpoints(communicationManager);
  }

  addObservation() {}
  getPage() {}
  getLatestPage() {}

  createNewPage(newPageName) {
    // Create write stream for appending the file
    const newFileStream = fs.createWriteStream(`${this.dataPath}/${newPageName}.ttl`, {
      flags: 'a'
    });

    const newWriter = new N3.Writer(newFileStream, {
      end: false
    });

    this.pages.push(newPageName);

    // Adding quads from feature of interest and observable property
    newWriter.addQuads(this.observableProperty.featureOfInterest.getQuads());
    newWriter.addQuads(this.observableProperty.getQuads());

    this.remainingObservations = this.observationsPerPage;

    return {
      newFileStream,
      newWriter
    };
  }

  getCollectionSubject(pageName) {
    return namedNode(
      `${this.observableProperty.subject.value}Series${pageName ? `/` + pageName : ''}`
    );
  }

  registerEndpoints(communicationManager) {
    const relativeURI = getRelativeURI(this.getCollectionSubject().id);

    communicationManager.addEndpoints({
      [relativeURI]: params => this.getLatestPage(params),
      [`${relativeURI}/:pageName`]: params => this.getPage(params)
    });
  }

  flushWriter() {
    // The writer keeps some quads in memory when the subject/predicate is the same.
    // By doing this, the writer kan shorten some triples by omitting the subject/predicate.
    // However, we want always a valid file after we added an observation, and thus flushes this.
    this.writer._write(this.writer._inDefaultGraph ? '.\n' : '\n}\n');
    this.writer._subject = null;
  }
}

export default PaginationAbstractStorage;
