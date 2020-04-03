import restify from 'restify';
import Domain from '@ssn/domain';
import { Storage, Accessors } from '@ssn/adapters';

import cors from './src/cors.js';
import parkings from './src/parkings.js';
import ParkingGentSourceReader from './src/ParkingGentSourceReader.js';

// Create a new domain
const domain = new Domain('http://127.0.0.1:8080');

// Config: Add feature of interest and observable properties to the domain
Object.entries(parkings).map(([parkingKey, options]) => {
  const featureOfInterest = domain.addFeatureOfInterest(parkingKey, options);
  const observableProperty = featureOfInterest.addObservableProperty('numberOfVacantParkingSpaces');

  const storage = new Storage.HydraPreviousNextStorage({
    observableProperty,
    dataPath: `./data/${parkingKey}`,
    observationsPerPage: 3
  });

  observableProperty.setStorageInterface(storage);

  observableProperty.on('observation', () =>
    console.log('New observation for parking', parkingKey)
  );
});

// Fetching
const sources = {
  'parkingsstatus.xml':
    'https://opendataportaalmobiliteitsbedrijf.stad.gent/datex2/v2/parkingsstatus',
  'parkings.xml': 'https://opendataportaalmobiliteitsbedrijf.stad.gent/datex2/v2/parkings'
};

new ParkingGentSourceReader(domain, sources, '*/5 * * * * *', {
  file: './src/mapping.yml',
  jar: './rmlmapper.jar',
  tempFolder: './rmlmapper-temp',
  removeTempFolders: true
});

// Publishing the files through a Restify webserver
const server = restify.createServer();
server.use(cors);

// Setting the endpoints on the server, with the domain
new Accessors.WebServer(domain, server);

// Start the server
server.listen(8080, '127.0.0.1');
