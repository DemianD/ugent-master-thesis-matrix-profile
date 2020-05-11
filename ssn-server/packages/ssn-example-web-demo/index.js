import N3 from 'n3';
import MatrixProfileInterface from '@ssn/matrix-profile-interface';
import { Domain, CatalogInterface, BPlusTreeStorage, CommunicationManager } from '@ssn/core';

import domains from './config.js';
import { DATEX } from './src/vocs.js';
import ParkingGentSourceReader from './src/readers/ParkingGentSourceReader.js';
import CreateSnippets from './src/snippets/index.js';

// Create a configuration manager
const communicationManager = new CommunicationManager();

Object.entries(domains).map(([city, { parkings, telraam = [] }]) => {
  const domain = new Domain(`https://mp-server.dem.be/${city}`);

  Object.entries(parkings).map(([parkingKey, options]) => {
    const featureOfInterest = domain.addFeatureOfInterest(parkingKey, options);

    const observableProperty = featureOfInterest.addObservableProperty(
      DATEX('numberOfVacantParkingSpaces')
    );

    const dataPath = `./data/${city}/${parkingKey}`;
    const nodesPath = `./data/${city}/${parkingKey}-nodes`;

    // Add the tree storage interface
    const storageInterface = new BPlusTreeStorage(observableProperty, communicationManager, {
      dataPath,
      observationsPerPage: 288,
      degree: 8,
      nodesPath
    });

    storageInterface.boot();
    storageInterface.listen();

    const createSnippets = new CreateSnippets(
      storageInterface.tree,
      storageInterface.getCollection(),
      dataPath,
      nodesPath
    );

    // storageInterface.tree.disk.on('write', node => {
    //   createSnippets.create(node);
    // });

    if (city === 'leuven') {
      new MatrixProfileInterface(communicationManager, storageInterface.getCollection(), {
        resultsFolder: `./matrix-profiles/${city}/${parkingKey}`,
        queueFolder: '../../../matrix-profile-service/queue',
        seriesWindow: 5 * 12 * 24 * 365,
        windowSizes: [1 * 12 * 24, 1 * 12 * 24 * 7, 1 * 12 * 24 * 30]
      });
    }
  });

  Object.entries(telraam).map(([id, options]) => {
    const featureOfInterest = domain.addFeatureOfInterest(id, options);

    const observableProperty = featureOfInterest.addObservableProperty(
      DATEX('numberOfPassingCars')
    );

    const dataPath = `./data/telraam/${city}/${id}`;
    const nodesPath = `./data/telraam/${city}/${id}-nodes`;

    // Add the tree storage interface
    const storageInterface = new BPlusTreeStorage(observableProperty, communicationManager, {
      dataPath,
      observationsPerPage: 24 * 3,
      degree: 8,
      nodesPath
    });

    storageInterface.boot();
    storageInterface.listen();

    new MatrixProfileInterface(communicationManager, storageInterface.getCollection(), {
      resultsFolder: `./matrix-profiles/telraam/${city}/${id}`,
      queueFolder: '../../../matrix-profile-service/queue',
      seriesWindow: 24 * 365,
      windowSizes: [24, 24 * 7, 24 * 30]
    });
  });

  if (city === 'gent') {
    // Fetching
    const sources = {
      'parkingsstatus.xml': 'https://opendataportaalmobiliteitsbedrijf.stad.gent/datex2/v2/parkingsstatus',
      'parkings.xml': 'https://opendataportaalmobiliteitsbedrijf.stad.gent/datex2/v2/parkings'
    };

    new ParkingGentSourceReader(domain, sources, '*/5 * * * *', {
      file: './src/readers/mapping-gent.yml',
      jar: './rmlmapper.jar',
      tempFolder: './temp',
      removeTempFolders: true
    });
  }

  new CatalogInterface(communicationManager, domain);
});

// Start the server
communicationManager.listen(8080, '127.0.0.1');
