import fs from 'fs';
import N3 from 'n3';

import AbstractStorage from './AbstractStorage.js';
import createDirectoryIfNotExistsSync from '../utils/createDirectoryIfNotExistsSync.js';
import readDirectorySync from '../utils/readDirectorySync.js';
import { RDF, HYDRA, SOSA } from '../utils/vocs.js';

const { namedNode, quad } = N3.DataFactory;

class HydraPreviousNextStorage extends AbstractStorage {
  constructor(featureOfInterest, observableProperty, dataPath, observationsPerPage) {
    super();

    this.featureOfInterest = featureOfInterest;
    this.observableProperty = observableProperty;

    this.dataPath = dataPath;
    this.observationsPerPage = observationsPerPage;

    // Subject of the collection
    this.collectionSubject = namedNode(`${observableProperty.subject.value}/collection`);

    this.boot();
  }

  boot() {
    // Create directory if it does not exists
    createDirectoryIfNotExistsSync(this.dataPath);

    // On boot, find the latest file based on folder name
    const files = readDirectorySync(this.dataPath, '.ttl');

    // If there were no files, create a new page
    if (files.length === 0) {
      this.createNewPage();
      return;
    }

    const fileName = files[files.length - 1];
    const pageName = fileName.replace('.ttl', '');

    this.pageNameNamed = namedNode(`${this.collectionSubject.value}/${pageName}`);

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

  addObservation(observationQuads) {
    // Add the quads for the Observation
    this.writer.addQuads(observationQuads);

    // Add a hydra:member to the collection
    this.writer.addQuad(quad(this.collectionSubject, HYDRA('member'), observationQuads[0].subject));

    this.remainingObservations -= 1;

    if (this.remainingObservations == 0) {
      this.createNewPage();
    } else {
      this.flushWriter();
    }
  }

  createNewPage() {
    const hasPrevious = this.fileStream !== undefined;
    const newPageName = new Date().toISOString();

    // Create write stream for appending the file
    const newFileStream = fs.createWriteStream(`${this.dataPath}/${newPageName}.ttl`, {
      flags: 'a'
    });

    const newWriter = new N3.Writer(newFileStream, {
      end: false
    });

    // Adding quads from feature of interest and observable property
    newWriter.addQuads(this.featureOfInterest.getQuads());
    newWriter.addQuads(this.observableProperty.getQuads());

    const newPageNameNamed = namedNode(`${this.collectionSubject.value}/${newPageName}`);

    // Addings quads for collection
    newWriter.addQuad(quad(this.collectionSubject, RDF('type'), HYDRA('collection')));
    newWriter.addQuad(quad(this.collectionSubject, HYDRA('view'), newPageNameNamed));

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

    this.remainingObservations = this.observationsPerPage;
    this.pageNameNamed = newPageNameNamed;

    this.flushWriter();
  }

  flushWriter() {
    // The writer keeps some quads in memory when the subject/predicate is the same.
    // By doing this, the writer kan shorten some triples by omitting the subject/predicate.
    // However, we want always a valid file after we added an observation, and thus flushes this.
    this.writer._write(this.writer._inDefaultGraph ? '.\n' : '\n}\n');
    this.writer._subject = null;
  }
}

export default HydraPreviousNextStorage;
