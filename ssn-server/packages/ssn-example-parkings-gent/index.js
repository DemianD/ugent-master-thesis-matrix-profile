import N3 from 'n3';
import MatrixProfileInterface from '@ssn/matrix-profile-interface';
import { Domain, CatalogInterface, BPlusTreeStorage, CommunicationManager } from '@ssn/core';

import domains from './config.js';
import { DATEX } from './src/vocs.js';
import ParkingGentSourceReader from './src/ParkingGentSourceReader.js';
import createSnippets from './src/snippets/createSnippets.js';

// Create a configuration manager
const communicationManager = new CommunicationManager();

Object.entries(domains).map(([city, { parkings }]) => {
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
      observationsPerPage: 1440,
      degree: 8,
      nodesPath
    });

    storageInterface.boot();
    storageInterface.listen();

    createSnippets(
      storageInterface.tree,
      storageInterface.tree.path[0],
      [1440],
      dataPath,
      nodesPath
    );

    if (city === 'leuven') {
      new MatrixProfileInterface(communicationManager, storageInterface.getCollection(), {
        resultsFolder: `./matrix-profiles/${city}/${parkingKey}`,
        queueFolder: '../../../matrix-profile-service/queue',
        seriesWindow: 5 * 12 * 24 * 365,
        windowSizes: [1 * 12 * 24, 1 * 12 * 24 * 7, 1 * 12 * 24 * 30]
      });
    }
  });

  if (city === 'gent') {
    // Fetching
    const sources = {
      'parkingsstatus.xml': 'https://opendataportaalmobiliteitsbedrijf.stad.gent/datex2/v2/parkingsstatus',
      'parkings.xml': 'https://opendataportaalmobiliteitsbedrijf.stad.gent/datex2/v2/parkings'
    };

    new ParkingGentSourceReader(domain, sources, '*/5 * * * *', {
      file: './src/mapping-gent.yml',
      jar: './rmlmapper.jar',
      tempFolder: './rmlmapper-temp',
      removeTempFolders: true
    });
  }

  new CatalogInterface(communicationManager, domain);
});

// Start the server
communicationManager.listen(8080, '127.0.0.1');
