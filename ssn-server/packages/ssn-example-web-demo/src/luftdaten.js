import Domain, { AppendOnlyBPlusTreeStorage, CatalogInterface } from '@ssn/core';
import MatrixProfileInterface from '@ssn/matrix-profile-interface';

import { OBSERVABLE_PROPERTY } from './vocs.js';
import CreateSnippets from './snippets/index.js';
import { luftdaten as luftdatenConfig } from '../config.js';

const luftdatenDomain = new Domain(`https://mp-server.dem.be/luftdaten`);

const init = (id, communicationManager, featureOfInterest, observablePropertyName) => {
  const observableProperty = featureOfInterest.addObservableProperty(
    OBSERVABLE_PROPERTY(observablePropertyName)
  );

  const dataPath = `./data/luftdaten/${id}/${observablePropertyName}`;
  const nodesPath = `./data/luftdaten/${id}-nodes/${observablePropertyName}`;
  const matrixProfilePath = `./matrix-profiles/luftdaten/${id}/${observablePropertyName}`;

  const storageInterface = new AppendOnlyBPlusTreeStorage(
    observableProperty,
    communicationManager,
    {
      dataPath,
      observationsPerPage: 288,
      degree: 8,
      nodesPath
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

  const collection = storageInterface.getCollection();

  new MatrixProfileInterface(communicationManager, collection, {
    resultsFolder: matrixProfilePath,
    queueFolder: '../../../../matrix-profile-service/queue',
    seriesWindow: 5 * 12 * 24 * 365,
    windowSizes: [1 * 12 * 24, 1 * 12 * 24 * 7, 1 * 12 * 24 * 30]
  });

  return observableProperty;
};

const luftdaten = communicationManager => {
  Object.entries(luftdatenConfig).map(([id, options]) => {
    const featureOfInterest = luftdatenDomain.addFeatureOfInterest(id, options);

    init(id, communicationManager, featureOfInterest, 'P1');
    init(id, communicationManager, featureOfInterest, 'P2');
  });

  new CatalogInterface(communicationManager, luftdatenDomain);
};

export default luftdaten;
