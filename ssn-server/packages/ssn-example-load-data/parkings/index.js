import N3 from 'n3';
import fs from 'fs';
import rimraf from 'rimraf';
import { Domain, TreeStorage, CommunicationManager } from '@ssn/core';
import MatrixProfileInterface from '@ssn/matrix-profile-interface';

const { literal } = N3.DataFactory;

import Download from './download.js';
import { exec } from '../utils.js';

const sleep = () => new Promise(resolve => setTimeout(() => resolve(), 1000));

// TODO: dit veranderen
import { DATEX } from '../../ssn-example-parkings-gent/src/vocs.js';

const fromDate = new Date(Date.UTC(2017, 7 - 1, 20, 14));
const toDate = new Date();

const parkings = {
  leuven: {
    baseUri: 'https://leuven.datapiloten.be/parking',
    folder: './data/leuven',
    parkings: {
      Philipssite: undefined,
      'De-Bond': undefined,
      Kinepolis: undefined,
      'Heilig-Hart': undefined,
      Station: undefined,
      Center: undefined,
      'Sint-Jacob': undefined,
      Ladeuze: undefined
    }
  },
  kortrijk: {
    baseUri: 'https://kortrijk.datapiloten.be/parking',
    folder: './data/kortrijk',
    parkings: {
      'P-Veemarkt': undefined,
      'P-Schouwburg': undefined,
      'P-Broeltorens': undefined,
      'P-Haven': undefined,
      'P-P+R-Expo': undefined,
      'P-Houtmarkt': undefined,
      'P-Budabrug': undefined,
      'P-K-in-Kortrijk': undefined,
      'P-Kortrijk-Weide': undefined
    }
  }
};

const communicationManager = new CommunicationManager();

Object.entries(parkings).map(async ([city, p]) => {
  // TODO: env variable
  const domain = new Domain(`https://mp-server.dem.be/${city}`);

  console.log('Downloading...');
  const parkingDownloader = new Download(p, fromDate, toDate);
  await parkingDownloader.download();

  console.log('Grouping...');
  await Promise.all(
    Object.keys(p.parkings).map(parking => {
      return exec(`python3 group.py ${p.folder}/${parking}.csv`);
    })
  );

  console.log('Storing in tree...');
  Object.keys(p.parkings).forEach(async parking => {
    // Configure domain:
    const featureOfInterest = domain.addFeatureOfInterest(parking);

    const observableProperty = featureOfInterest.addObservableProperty(
      DATEX('numberOfVacantParkingSpaces')
    );

    rimraf.sync(`../../ssn-example-parkings-gent/data/${city}/${parking}`);
    rimraf.sync(`../../ssn-example-parkings-gent/matrix-profiles/${city}/${parking}`);

    const storageInterface = new TreeStorage(observableProperty, communicationManager, {
      dataPath: `../../ssn-example-parkings-gent/data/${city}/${parking}`,
      observationsPerPage: 720,
      initialPageName: fromDate.toISOString()
    });

    const collection = storageInterface.getCollection();

    new MatrixProfileInterface(communicationManager, collection, {
      resultsFolder: `./matrix-profiles/${city}/${parking}`,
      queueFolder: '../../../../matrix-profile-service/queue',
      seriesWindow: 1 * 60 * 24 * 365,
      windowSizes: [1 * 60 * 24, 1 * 60 * 24 * 7, 1 * 60 * 24 * 30]
    });

    // Add observations
    const file = fs.readFileSync(`${p.folder}/${parking}-grouped.csv`, 'utf8');
    const lines = file.split('\n');

    lines.shift();
    lines.pop();

    let i = 0;

    for (let line of lines) {
      i++;

      if (i % 100 === 0) {
        await sleep();
      }

      const [dateString, number] = line.split(';');
      observableProperty.addObservation(new Date(dateString), literal(number));
    }
  });
});
