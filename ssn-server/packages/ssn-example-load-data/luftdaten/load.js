import N3 from 'n3';
import fs from 'fs';
import rimraf from 'rimraf';
import { Domain, AppendOnlyBPlusTreeStorage, CommunicationManager } from '@ssn/core';
import MatrixProfileInterface from '@ssn/matrix-profile-interface';

import { OBSERVABLE_PROPERTY } from '../vocs.js';
import { sleep } from '../utils.js';

// TODO: dit veranderen
import CreateSnippets from '../../ssn-example-web-demo/src/snippets/index.js';

const { literal } = N3.DataFactory;

const fromDateStore = new Date(Date.UTC(2018, 12 - 1, 1, 1));
const communicationManager = new CommunicationManager();

const init = (id, featureOfInterest, observablePropertyName) => {
  const observableProperty = featureOfInterest.addObservableProperty(
    OBSERVABLE_PROPERTY(observablePropertyName)
  );

  const dataPath = `../../ssn-example-web-demo/data/luftdaten/${id}/${observablePropertyName}`;
  const nodesPath = `../../ssn-example-web-demo/data/luftdaten/${id}-nodes/${observablePropertyName}`;
  const matrixProfilePath = `../../ssn-example-web-demo/matrix-profiles/luftdaten/${id}/${observablePropertyName}`;

  rimraf.sync(dataPath);
  rimraf.sync(nodesPath);
  rimraf.sync(matrixProfilePath);

  const storageInterface = new AppendOnlyBPlusTreeStorage(
    observableProperty,
    communicationManager,
    {
      dataPath,
      observationsPerPage: 288,
      degree: 8,
      nodesPath,
      initialPageName: fromDateStore.toISOString()
    }
  );

  storageInterface.boot();
  storageInterface.listen();

  const createSnippets = new CreateSnippets(
    storageInterface.tree,
    storageInterface.getCollection(),
    dataPath,
    nodesPath,
    12 * 24 * 7,
    true
  );

  storageInterface.tree.disk.on('write', node => {
    createSnippets.create(node);
  });

  const collection = storageInterface.getCollection();

  new MatrixProfileInterface(communicationManager, collection, {
    resultsFolder: matrixProfilePath,
    queueFolder: '../../../../matrix-profile-service/queue',
    seriesWindow: 5 * 12 * 24 * 365,
    windowSizes: [1 * 12 * 24, 1 * 12 * 24 * 7, 1 * 12 * 24 * 30]
  });

  return observableProperty;
};

const store = async id => {
  const domain = new Domain(`https://mp-server.dem.be/luftdaten`);

  const featureOfInterest = domain.addFeatureOfInterest(id);

  const P1ObservableProperty = init(id, featureOfInterest, 'P1');
  const P2ObservableProperty = init(id, featureOfInterest, 'P2');

  // Add observations
  console.log('Reading', `./data/${id}-grouped.csv`);

  const file = fs.readFileSync(`./data/${id}-grouped.csv`, 'utf8');
  const lines = file.split('\n');

  lines.shift();
  lines.pop();

  let i = 0;

  for (let line of lines) {
    const [dateString, P1, P2] = line.split(';');
    const date = new Date(`${dateString}.000Z`);

    if (date >= fromDateStore) {
      P1ObservableProperty.addObservation(date, literal(P1));
      P2ObservableProperty.addObservation(date, literal(P2));

      i++;

      if (i % 288 === 0) {
        console.log('sleep', date);
        await sleep(500);
      }
    }
  }
};

store(8777);
