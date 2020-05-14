import N3 from 'n3';
import fs from 'fs';
import rimraf from 'rimraf';
import { Domain, BPlusTreeStorage, CommunicationManager } from '@ssn/core';
import MatrixProfileInterface from '@ssn/matrix-profile-interface';

import { OBSERVABLE_PROPERTY } from '../vocs.js';
import { sleep } from '../utils.js';

// TODO: dit veranderen
import CreateSnippets from '../../ssn-example-web-demo/src/snippets/index.js';
import { XSD } from '../../ssn-example-web-demo/src/vocs.js';

const { literal } = N3.DataFactory;

const fromDateStore = new Date(Date.UTC(2019, 8 - 1, 1, 0, 0, 0, 0));
const communicationManager = new CommunicationManager();

const observationsPerPage = 96;

const init = (id, featureOfInterest, observablePropertyName) => {
  const observableProperty = featureOfInterest.addObservableProperty(
    OBSERVABLE_PROPERTY(observablePropertyName)
  );

  const dataPath = `../../ssn-example-web-demo/data/fietstelling/${id}`;
  const nodesPath = `../../ssn-example-web-demo/data/fietstelling/${id}-nodes`;
  const matrixProfilePath = `../../ssn-example-web-demo/matrix-profiles/fietstelling/${id}`;

  rimraf.sync(dataPath);
  rimraf.sync(nodesPath);

  const storageInterface = new BPlusTreeStorage(observableProperty, communicationManager, {
    dataPath,
    observationsPerPage,
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
    4 * 24 * 7, // 4 observaties per uur: 00:00, 00:15, 00:30, 00:45
    true
  );

  storageInterface.tree.disk.on('write', node => {
    createSnippets.create(node);
  });

  const collection = storageInterface.getCollection();

  new MatrixProfileInterface(communicationManager, collection, {
    resultsFolder: matrixProfilePath,
    queueFolder: '../../../../matrix-profile-service/queue',
    seriesWindow: 5 * 24 * 365,
    windowSizes: [4 * 24, 4 * 24 * 7, 4 * 24 * 30]
  });

  return observableProperty;
};

const store = async id => {
  const domain = new Domain(`https://mp-server.dem.be/fietstelling`);

  const featureOfInterest = domain.addFeatureOfInterest(id);
  const observableProperty = init(id, featureOfInterest, 'numberOfPassingBikes');

  // Add observations
  console.log('Reading', `./data/${id}.csv`);

  const file = fs.readFileSync(`./data/${id}.csv`, 'utf8');
  const lines = file.split('\n');

  lines.shift();
  lines.pop();

  let i = 0;

  for (let line of lines) {
    const [dateString, amount] = line.split(';');
    const date = new Date(`${dateString}.000Z`);

    if (date >= fromDateStore) {
      observableProperty.addObservation(date, literal(amount, XSD('integer')));

      i++;

      if (i % observationsPerPage === 0) {
        console.log('sleep', date);
        await sleep(400);
      }
    }
  }
};

store('combined');

for (let i = 1; i <= 25; i++) {
  store(`${i}`);
}
