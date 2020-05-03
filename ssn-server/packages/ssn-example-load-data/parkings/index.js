import N3 from 'n3';
import fs from 'fs';
import rimraf from 'rimraf';
import { Domain, BPlusTreeStorage, CommunicationManager } from '@ssn/core';
import MatrixProfileInterface from '@ssn/matrix-profile-interface';

const { literal } = N3.DataFactory;

import Download from './download.js';
import { exec } from '../utils.js';

const sleep = () => new Promise(resolve => setTimeout(() => resolve(), 1000));

// TODO: dit veranderen
import { DATEX } from '../../ssn-example-parkings-gent/src/vocs.js';

const fromDate = new Date(Date.UTC(2018, 12, 1, 1));
const toDate = new Date();

const parkings = {
  leuven: {
    baseUri: 'https://leuven.datapiloten.be/parking',
    folder: './data/leuven',
    parkings: {
      Philipssite: undefined, // 17, 19
      'De-Bond': undefined, // 3, 9
      Kinepolis: undefined, // 5
      'Heilig-Hart': undefined, // 4, 10
      Station: undefined,
      Center: undefined,
      'Sint-Jacob': undefined,
      Ladeuze: undefined // 11, 16
    }
  },
  kortrijk: {
    baseUri: 'https://kortrijk.datapiloten.be/parking',
    folder: './data/kortrijk',
    parkings: {
      'P-Veemarkt': undefined, // 8, 15
      'P-Schouwburg': undefined,
      'P-Broeltorens': undefined, // 1, 6, 12, 18
      'P-Haven': undefined,
      'P-P+R-Expo': undefined,
      'P-Houtmarkt': undefined,
      'P-Budabrug': undefined, // 13
      'P-K-in-Kortrijk': undefined, // 7, 14
      'P-Kortrijk-Weide': undefined // 2
    }
  }
};

const communicationManager = new CommunicationManager();

Object.entries(parkings).map(async ([city, p]) => {
  // console.log('Downloading...');
  // const parkingDownloader = new Download(p, fromDate, toDate);
  // await parkingDownloader.download();
  // const parkingNames = Object.keys(p.parkings);
  // console.log('Grouping...');
  // for (let parkingName of parkingNames) {
  //   // Doing this sync because of memory issues
  //   await exec(`python3 group.py ${p.folder}/${parkingName}.csv`);
  // }
});

const store = async (folder, city, parking) => {
  const domain = new Domain(`https://mp-server.dem.be/parkings/${city}`);
  const fromDateStore = new Date(Date.UTC(2018, 12 - 1, 1, 1));

  const featureOfInterest = domain.addFeatureOfInterest(parking);

  const observableProperty = featureOfInterest.addObservableProperty(
    DATEX('numberOfVacantParkingSpaces')
  );

  rimraf.sync(`../../ssn-example-parkings-gent/data/${city}/${parking}`);
  rimraf.sync(`../../ssn-example-parkings-gent/data/${city}/${parking}-nodes`);
  // rimraf.sync(`../../ssn-example-parkings-gent/matrix-profiles/${city}/${parking}`);

  const storageInterface = new BPlusTreeStorage(observableProperty, communicationManager, {
    dataPath: `../../ssn-example-parkings-gent/data/${city}/${parking}`,
    observationsPerPage: 720,
    degree: 8,
    nodesPath: `../../ssn-example-parkings-gent/data/${city}/${parking}-nodes`,
    initialPageName: fromDateStore.toISOString()
  });

  storageInterface.boot();
  storageInterface.listen();

  // const collection = storageInterface.getCollection();

  // new MatrixProfileInterface(communicationManager, collection, {
  //   resultsFolder: `./matrix-profiles/${city}/${parking}`,
  //   queueFolder: '../../../../matrix-profile-service/queue',
  //   seriesWindow: 5 * 12 * 24 * 365,
  //   windowSizes: [1 * 12 * 24, 1 * 12 * 24 * 7, 1 * 12 * 24 * 30]
  // });

  // Add observations
  console.log('Reading', `${folder}/${parking}-grouped.csv`);
  const file = fs.readFileSync(`${folder}/${parking}-grouped.csv`, 'utf8');
  const lines = file.split('\n');

  lines.shift();
  lines.pop();

  let i = 0;

  for (let line of lines) {
    const [dateString, number] = line.split(';');
    const date = new Date(dateString);

    if (date > fromDateStore) {
      observableProperty.addObservation(date, literal(number));

      i++;

      if (i % 1000 === 0) {
        console.log('sleep', date);
        await sleep();
      }
    }
  }
};

store(parkings.leuven.folder, 'leuven', 'Philipssite');
