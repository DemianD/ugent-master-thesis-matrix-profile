import { Domain, CatalogInterface, TreeStorage, CommunicationManager } from '@ssn/core';
import MatrixProfileInterface from '@ssn/matrix-profile-interface';

import parkings from './src/parkings.js';
import ParkingGentSourceReader from './src/ParkingGentSourceReader.js';
import { DATEX } from './src/vocs.js';

// Create a new domain
const domain = new Domain('http://127.0.0.1:8080');

// Create a configuration manager
const communicationManager = new CommunicationManager();

// Config: Add feature of interest and observable properties to the domain
Object.entries(parkings).map(([parkingKey, options]) => {
  const featureOfInterest = domain.addFeatureOfInterest(parkingKey, options);
  const observableProperty = featureOfInterest.addObservableProperty(
    DATEX('numberOfVacantParkingSpaces')
  );

  // Add the tree storage interface
  const storageInterface = new TreeStorage(observableProperty, communicationManager, {
    dataPath: `./data/${parkingKey}`,
    observationsPerPage: 3
  });

  const collection = storageInterface.getCollection();

  // Add the matrix profile storage interface
  new MatrixProfileInterface(communicationManager, collection, {
    resultsFolder: `./matrix-profiles/${parkingKey}`,
    queueFolder: '../../../matrix-profile-service/queue',
    seriesWindow: 1000,
    windowSizes: [10, 20, 30]
  });
});

new CatalogInterface(communicationManager, domain);

// Fetching
const sources = {
  'parkingsstatus.xml': 'https://opendataportaalmobiliteitsbedrijf.stad.gent/datex2/v2/parkingsstatus',
  'parkings.xml': 'https://opendataportaalmobiliteitsbedrijf.stad.gent/datex2/v2/parkings'
};

new ParkingGentSourceReader(domain, sources, '*/5 * * * * *', {
  file: './src/mapping.yml',
  jar: './rmlmapper.jar',
  tempFolder: './rmlmapper-temp',
  removeTempFolders: true
});

communicationManager.listen(8080, '127.0.0.1');
