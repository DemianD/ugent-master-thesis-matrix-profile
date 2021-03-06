import MatrixProfileInterface from '@ssn/matrix-profile-interface';
import {
  Domain,
  CatalogInterface,
  AppendOnlyBPlusTreeStorage,
  CommunicationManager
} from '@ssn/core';

import { DATEX, OBSERVABLE_PROPERTY } from './src/vocs.js';
import { parkingDomains, telraams, fietstelling } from './config.js';
import CreateSnippets from './src/snippets/index.js';
import ParkingGentSourceReader from './src/readers/ParkingGentSourceReader.js';
import luftdaten from './src/luftdaten.js';

// Create a configuration manager
const communicationManager = new CommunicationManager();

// Parkings
Object.entries(parkingDomains).map(([city, parkings]) => {
  const parkingsDomain = new Domain(`https://mp-server.dem.be/parkings/${city}`);

  Object.entries(parkings).map(([parkingKey, options]) => {
    const featureOfInterest = parkingsDomain.addFeatureOfInterest(parkingKey, options);

    const observableProperty = featureOfInterest.addObservableProperty(
      DATEX('numberOfVacantParkingSpaces')
    );

    const dataPath = `./data/${city}/${parkingKey}`;
    const nodesPath = `./data/${city}/${parkingKey}-nodes`;

    // Add the tree storage interface
    const storageInterface = new AppendOnlyBPlusTreeStorage(
      observableProperty,
      communicationManager,
      {
        dataPath,
        observationsPerPage: 2880,
        degree: 8,
        nodesPath
      }
    );

    storageInterface.boot();
    storageInterface.listen();

    if (city === 'gent') {
      // const createSnippets = new CreateSnippets(
      //   storageInterface.tree,
      //   storageInterface.getCollection(),
      //   dataPath,
      //   nodesPath
      // );
      // storageInterface.tree.disk.on('write', node => {
      //   createSnippets.create(node);
      // });
    }

    new MatrixProfileInterface(communicationManager, storageInterface.getCollection(), {
      resultsFolder: `./matrix-profiles/${city}/${parkingKey}`,
      queueFolder: '../../../matrix-profile-service/queue',
      seriesWindow: 5 * 12 * 24 * 365,
      windowSizes: [1 * 12 * 24, 1 * 12 * 24 * 7, 1 * 12 * 24 * 30]
    });
  });

  if (city === 'gent') {
    // Fetching
    const sources = {
      'parkingsstatus.xml': 'https://opendataportaalmobiliteitsbedrijf.stad.gent/datex2/v2/parkingsstatus',
      'parkings.xml': 'https://opendataportaalmobiliteitsbedrijf.stad.gent/datex2/v2/parkings'
    };

    new ParkingGentSourceReader(parkingsDomain, sources, '*/5 * * * *', {
      file: './src/readers/mapping-gent.yml',
      jar: './rmlmapper.jar',
      tempFolder: './temp',
      removeTempFolders: true
    });
  }

  new CatalogInterface(communicationManager, parkingsDomain);
});

// Telraams
const telraamDomain = new Domain(`https://mp-server.dem.be/telraam`);

Object.entries(telraams).map(([id, options]) => {
  const featureOfInterest = telraamDomain.addFeatureOfInterest(id, options);

  const observableProperty = featureOfInterest.addObservableProperty(DATEX('numberOfPassingCars'));

  const dataPath = `./data/telraam/${id}`;
  const nodesPath = `./data/telraam/${id}-nodes`;

  // Add the tree storage interface
  const storageInterface = new AppendOnlyBPlusTreeStorage(
    observableProperty,
    communicationManager,
    {
      dataPath,
      observationsPerPage: 14 * 3,
      degree: 8,
      nodesPath
    }
  );

  storageInterface.boot();
  storageInterface.listen();

  new MatrixProfileInterface(communicationManager, storageInterface.getCollection(), {
    resultsFolder: `./matrix-profiles/telraam/${id}`,
    queueFolder: '../../../matrix-profile-service/queue',
    seriesWindow: 14 * 365,
    windowSizes: [14, 14 * 7, 14 * 30]
  });
});

new CatalogInterface(communicationManager, telraamDomain);

// Fietstelling
const fietstellingDomain = new Domain(`https://mp-server.dem.be/fietstelling`);

Object.entries(fietstelling).map(([id, options]) => {
  const featureOfInterest = fietstellingDomain.addFeatureOfInterest(id, options);

  const observableProperty = featureOfInterest.addObservableProperty(
    OBSERVABLE_PROPERTY('numberOfPassingBikes')
  );

  const dataPath = `./data/fietstelling/${id}`;
  const nodesPath = `./data/fietstelling/${id}-nodes`;

  // Add the tree storage interface
  const storageInterface = new AppendOnlyBPlusTreeStorage(
    observableProperty,
    communicationManager,
    {
      dataPath,
      observationsPerPage: 960,
      degree: 8,
      nodesPath
    }
  );

  storageInterface.boot();
  storageInterface.listen();

  new MatrixProfileInterface(communicationManager, storageInterface.getCollection(), {
    resultsFolder: `./matrix-profiles/fietstelling/${id}`,
    queueFolder: '../../../matrix-profile-service/queue',
    seriesWindow: 5 * 24 * 365,
    windowSizes: [4 * 24, 4 * 24 * 7, 4 * 24 * 30]
  });
});

new CatalogInterface(communicationManager, fietstellingDomain);

// Luftdaten
luftdaten(communicationManager);

// Start the server
communicationManager.listen(8080, '127.0.0.1');
