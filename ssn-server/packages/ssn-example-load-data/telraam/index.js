import N3 from 'n3';
import fs from 'fs';
import rimraf from 'rimraf';
import { Domain, BPlusTreeStorage, CommunicationManager } from '@ssn/core';
import MatrixProfileInterface from '@ssn/matrix-profile-interface';

const { literal } = N3.DataFactory;

import { exec } from '../utils.js';

const sleep = ms => new Promise(resolve => setTimeout(() => resolve(), ms));

// TODO: dit veranderen
import { DATEX } from '../../ssn-example-web-demo/src/vocs.js';
import CreateSnippets from '../../ssn-example-web-demo/src/snippets/index.js';

const communicationManager = new CommunicationManager();

const store = async (city, id) => {
  const domain = new Domain(`https://mp-server.dem.be/telraam`);

  // TODO: first date
  const fromDateStore = new Date(Date.UTC(2018, 12 - 1, 1, 1));

  const featureOfInterest = domain.addFeatureOfInterest(id);

  const observableProperty = featureOfInterest.addObservableProperty(
    DATEX('numberOfPassingCars') // TODO: dit bestaat niet.
  );

  const dataPath = `../../ssn-example-web-demo/data/telraam/${city}/${id}`;
  const nodesPath = `../../ssn-example-web-demo/data/telraam/${city}/${id}-nodes`;
  const matrixProfilePath = `../../ssn-example-web-demo/matrix-profiles/telraam/${city}/${id}`;

  rimraf.sync(dataPath);
  rimraf.sync(nodesPath);
  rimraf.sync(matrixProfilePath);

  const storageInterface = new BPlusTreeStorage(observableProperty, communicationManager, {
    dataPath,
    observationsPerPage: 24 * 3,
    degree: 8,
    nodesPath,
    initialPageName: fromDateStore.toISOString()
  });

  storageInterface.boot();
  storageInterface.listen();

  const createSnippets = new CreateSnippets(
    storageInterface.tree,
    storageInterface.getCollection(),
    dataPath,
    nodesPath,
    24 * 7,
    false
  );

  storageInterface.tree.disk.on('write', node => {
    createSnippets.create(node);
  });

  const collection = storageInterface.getCollection();

  new MatrixProfileInterface(communicationManager, collection, {
    resultsFolder: matrixProfilePath,
    queueFolder: '../../../../matrix-profile-service/queue',
    seriesWindow: 24 * 365,
    windowSizes: [24, 24 * 7, 24 * 30]
  });

  // Add observations
  console.log('Reading', `./data/${id}.txt`);

  const file = fs.readFileSync(`./data/${id}.txt`, 'utf8');
  const lines = file.split('\n');

  lines.shift();
  lines.pop();

  let i = 0;

  for (let line of lines) {
    const [dateString, pct_up, pedestrian, bike, car, lorry] = line.split(';');
    console.log(dateString);
    const date = new Date(dateString);

    if (date > fromDateStore) {
      observableProperty.addObservation(date, literal(car));

      i++;

      if (i % (24 * 3) === 0) {
        console.log('sleep', date);
        await sleep(500);
      }
    }
  }
};

store('leuven', 348180);
