import fs from 'fs';
import N3 from 'n3';
import path from 'path';
import slugify from 'slugify';
import { MP, SOSA } from './src/vocs.js';
import getRelativeURI from '../ssn-core/src/utils/getRelativeURI.js';
import createDirectoryIfNotExists from '../ssn-core/src/utils/createDirectoryIfNotExistsSync.js';

const { namedNode, quad } = N3.DataFactory;

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

    fs.writeFile(
      `${this.queueFolder}/${body.key}-${Date.now()}.json`,
      JSON.stringify(body),
      error => {
        error && console.error(error);
      }
    );
  }

  getMatrixProfileSubject(windowSize) {
    return namedNode(
      `${this.collection.getSubject().value}/matrix-profiles${windowSize ? '/' + windowSize : ''}`
    );
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
        [relativeURI]: params => console.log('Not yet implemented')
      });
    }
  }
}

export default MatrixProfileInterface;
