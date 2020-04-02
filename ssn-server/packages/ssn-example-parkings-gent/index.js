import Domain from 'ssn-domain';

import parkings from './src/parkings.js';
import ParkingGentSourceReader from './src/ParkingGentSourceReader.js';

// Config
const domain = new Domain('http://127.0.0.1:8000');

Object.entries(parkings).map(([parkingKey, parkingQuads]) => {
  domain
    .addFeatureOfInterest(parkingKey, {
      options: parkingQuads
    })
    .addObservableProperty('numberOfVacantParkingSpaces')
    .on('observation', () => {
      console.log('Observation added for:', parkingKey);
    });
});

// Fetching
const sources = {
  'parkingsstatus.xml': 'https://opendataportaalmobiliteitsbedrijf.stad.gent/datex2/v2/parkingsstatus',
  'parkings.xml': 'https://opendataportaalmobiliteitsbedrijf.stad.gent/datex2/v2/parkings'
};

const refreshInterval = '*/5 * * * * *';

new ParkingGentSourceReader(domain, sources, refreshInterval, {
  file: './src/parkings-gent.yml',
  jar: './rmlmapper.jar',
  tempFolder: './rmlmapper-temp',
  removeTempFolders: true
});

// Storing
