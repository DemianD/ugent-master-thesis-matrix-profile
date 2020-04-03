import fs from 'fs';
import N3 from 'n3';

import AbstractStorage from './AbstractStorage.js';

import createDirectoryIfNotExists from '../utils/createDirectoryIfNotExistsSync.js';
import readDirectorySync from '../utils/readDirectorySync.js';
import { SOSA } from '../utils/vocs.js';

const { namedNode, quad } = N3.DataFactory;

class PaginationAbstractStorage extends AbstractStorage {
  constructor({ observableProperty, dataPath, observationsPerPage }) {
    super();

    this.observableProperty = observableProperty;

    this.dataPath = dataPath;
    this.observationsPerPage = observationsPerPage;

    this.collectionSubject = namedNode(`${observableProperty.subject.value}/collection`);
  }

  boot() {
    // Create directory if it does not exists
    createDirectoryIfNotExists(this.dataPath);

    // On boot, find the latest file based on folder name
    const files = readDirectorySync(this.dataPath, '.ttl');

    // If there were no files, create a new page
    if (files.length === 0) {
      this.createNewPage();
      return;
    }

    const fileName = files[files.length - 1];

    this.pageName = fileName.replace('.ttl', '');
    this.pageNameNamed = namedNode(`${this.collectionSubject.value}/${this.pageName}`);

    // Count how many observations there are in the file
    const content = fs.readFileSync(`${this.dataPath}/${fileName}`, 'utf-8');

    const numberOfObservations = content.split(SOSA('Observation').value).length - 1;
    this.remainingObservations = this.observationsPerPage - numberOfObservations;

    // Create the streams
    this.fileStream = fs.createWriteStream(`${this.dataPath}/${fileName}`, {
      flags: 'a'
    });

    this.writer = new N3.Writer(this.fileStream, {
      end: false
    });
  }

  addObservation() {}
  getPage() {}

  createNewPage(newPageName) {
    // Create write stream for appending the file
    const newFileStream = fs.createWriteStream(`${this.dataPath}/${newPageName}.ttl`, {
      flags: 'a'
    });

    const newWriter = new N3.Writer(newFileStream, {
      end: false
    });

    // Adding quads from feature of interest and observable property
    newWriter.addQuads(this.observableProperty.featureOfInterest.getQuads());
    newWriter.addQuads(this.observableProperty.getQuads());

    this.remainingObservations = this.observationsPerPage;

    return {
      newFileStream,
      newWriter
    };
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
