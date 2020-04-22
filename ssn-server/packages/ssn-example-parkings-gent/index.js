import N3 from 'n3';
import MatrixProfileInterface from '@ssn/matrix-profile-interface';
import { Domain, CatalogInterface, TreeStorage, CommunicationManager } from '@ssn/core';

import parkings from './src/parkings.js';
import { RDF, DATEX, RDFS } from './src/vocs.js';

const { quad, literal } = N3.DataFactory;

// Create a new domain
const domainGent = new Domain('https://mp-server.dem.be');

// Create a configuration manager
const communicationManager = new CommunicationManager();

// Config: Add feature of interest and observable properties to the domain
Object.entries(parkings).map(([parkingKey, options]) => {
  const featureOfInterest = domainGent.addFeatureOfInterest(parkingKey, options);

  const observableProperty = featureOfInterest.addObservableProperty(
    DATEX('numberOfVacantParkingSpaces')
  );

  // Add the tree storage interface
  new TreeStorage(observableProperty, communicationManager, {
    dataPath: `./data/${parkingKey}`,
    observationsPerPage: 720,
    initialPageName: '2019-11-10T01:00:00.000Z'
  });
});

// Leuven
const domainLeuven = new Domain('https://mp-server.dem.be/leuven');

const philipssite = domainLeuven.addFeatureOfInterest('Philipssite', {
  quads: subject => [
    quad(subject, RDF('type'), DATEX('UrbanParkingSite')),
    quad(subject, RDFS('label'), literal('Philipssite')),
    quad(subject, DATEX('parkingName'), literal('Philipssite')),
    quad(subject, DATEX('parkingNumberOfSpaces'), literal(1125))
  ]
});

const philipssiteObservableProperty = philipssite.addObservableProperty(
  DATEX('numberOfVacantParkingSpaces')
);

const storageInterface = new TreeStorage(philipssiteObservableProperty, communicationManager, {
  dataPath: `./data/leuven/Philipssite`,
  observationsPerPage: 720
});

new MatrixProfileInterface(communicationManager, storageInterface.getCollection(), {
  resultsFolder: `./matrix-profiles/leuven/Philipssite`,
  queueFolder: '../../../matrix-profile-service/queue',
  seriesWindow: 5 * 12 * 24 * 365,
  windowSizes: [1 * 12 * 24, 1 * 12 * 24 * 7, 1 * 12 * 24 * 30]
});

// Catalogs
new CatalogInterface(communicationManager, domainGent);
new CatalogInterface(communicationManager, domainLeuven);

// Start the server
communicationManager.listen(8080, '127.0.0.1');
