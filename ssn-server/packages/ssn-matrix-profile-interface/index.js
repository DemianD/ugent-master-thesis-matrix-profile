import fs from 'fs';
import N3 from 'n3';
import path from 'path';
import slugify from 'slugify';
import { MP, SOSA, RDF, XSD } from './src/vocs.js';
import getRelativeURI from '../ssn-core/src/utils/getRelativeURI.js';
import createDirectoryIfNotExists from '../ssn-core/src/utils/createDirectoryIfNotExistsSync.js';
import createMatrixProfileLiterals from './src/createMatrixProfileLiterals.js';

const { namedNode, quad, literal } = N3.DataFactory;

class MatrixProfileInterface {
  constructor(communicationManager, collection, options) {
    this.communicationManager = communicationManager;
    this.collection = collection;

    this.resultsFolder = path.resolve(options.resultsFolder);
    this.queueFolder = options.queueFolder;

    this.windowSizes = options.windowSizes;
    this.seriesWindow = options.seriesWindow;

    this.boot();
  }

  boot() {
    // Create the results folder and queue folder
    createDirectoryIfNotExists(this.resultsFolder);
    createDirectoryIfNotExists(this.queueFolder);

    // Register the endpoints and make the matrix profile discovarable
    this.registerEndpoints();

    // Unique key
    this.key = slugify(this.getMatrixProfileSubject().value, {
      strict: true
    });

    this.collection.observableProperty.on('observation', observationStore => {
      this.createQueueFile(observationStore);
    });
  }

  createQueueFile(observationStore) {
    const value = observationStore.getQuads(undefined, SOSA('hasSimpleResult'), undefined)[0].object
      .value;

    const date = observationStore.getQuads(undefined, SOSA('resultTime'), undefined)[0].object
      .value;

    const body = {
      key: this.key,
      window_sizes: this.windowSizes,
      series_window: this.seriesWindow,
      results_folder: this.resultsFolder,
      value: value,
      date: date
    };

    const safeDate = date.split(':').join('-').replace('.', '-');

    fs.writeFileSync(`${this.queueFolder}/${body.key}-${safeDate}.json`, JSON.stringify(body));
  }

  getMatrixProfileSubject(windowSize) {
    return namedNode(
      `${this.collection.getSubject().value}/matrix-profiles${windowSize ? '/' + windowSize : ''}`
    );
  }

  async getMatrixProfile(windowSize) {
    const subject = this.getMatrixProfileSubject(windowSize);
    const literals = await createMatrixProfileLiterals(`${this.resultsFolder}/${windowSize}.txt`);

    const quads = [
      quad(subject, RDF('type'), MP('MatrixProfile')),
      quad(subject, MP('windowSize'), literal(windowSize, XSD('integer'))),
      quad(subject, MP('dates'), literal(literals.dates, MP('array'))),
      quad(subject, MP('distances'), literal(literals.distances, MP('array'))),
      quad(subject, MP('indexes'), literal(literals.indexes, MP('array')))
    ];

    return {
      immutable: false,
      body: quads
    };
  }

  registerEndpoints() {
    for (let windowSize of this.windowSizes) {
      const matrixProfileSubject = this.getMatrixProfileSubject(windowSize);
      const relativeURI = getRelativeURI(matrixProfileSubject.value);

      // Add quad to the collection to make the matrix profile discoverable
      this.collection.addQuad(
        quad(this.collection.getSubject(), MP('matrixProfile'), matrixProfileSubject)
      );

      // Add a new endpoint for the matrix profile
      this.communicationManager.addEndpoints({
        [relativeURI]: params => this.getMatrixProfile(windowSize)
      });
    }
  }
}

export default MatrixProfileInterface;
