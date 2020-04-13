import {
  Domain,
  CatalogInterface,
  HydraStorage,
  TreeStorage,
  CommunicationManager
} from '@ssn/core';

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

  const storageInterface = new TreeStorage(observableProperty, communicationManager, {
    dataPath: `./data/${parkingKey}`,
    observationsPerPage: 3
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
