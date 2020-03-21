import N3 from 'n3';
import fs from 'fs';
import nodeFetch from 'node-fetch';
import zeitFetch from '@zeit/fetch-retry';

const fetch = zeitFetch(nodeFetch);

import { pad, storeQuads, dateToString } from '../utils.mjs';

const { namedNode } = N3.DataFactory;

// Parameters:
const baseUri = 'https://kortrijk.datapiloten.be/parking';
const folder = './data/kortrijk';

const parkings = {
  'P-Veemarkt': undefined,
  'P-Schouwburg': undefined,
  'P-Broeltorens': undefined,
  'P-Haven': undefined,
  'P-P+R-Expo': undefined,
  'P-Houtmarkt': undefined,
  'P-Budabrug': undefined,
  'P-K-in-Kortrijk': undefined,
  'P-Kortrijk-Weide': undefined
};

let date = new Date(2019, 12 - 2, 10);
const endDate = new Date(2020, 3 - 1, 20);

// End parameters

const pagehours = [
  'T01:00:00',
  'T04:00:00',
  'T07:00:00',
  'T10:00:00',
  'T13:00:00',
  'T16:00:00',
  'T19:00:00',
  'T22:00:00'
];

const main = async () => {
  // Create for each parking a write stream
  Object.keys(parkings).forEach(parking => {
    parkings[parking] = fs.createWriteStream(`${folder}/${parking}.csv`);
    parkings[parking].write('date;value\n');
  });

  while (date < endDate) {
    const partialPagename = dateToString(date, '-');

    // Fetch the page for a full day, and store the response as quads in a store.
    // The store is returned.
    const promises = pagehours.map(pagehour => {
      const pagename = `${partialPagename}${pagehour}`;
      const url = `${baseUri}?page=${pagename}`;

      console.log(pagename, url);

      const store = new N3.Store();

      return fetch(url)
        .then(response => response.text())
        .then(data => storeQuads(store, data))
        .then(() => store)
        .catch(err => console.error(url, err));
    });

    // Because we need to ensure sequence, we wait for all stores to finish first
    const stores = await Promise.all(promises);

    const storePromises = stores.map(store => {
      return new Promise(resolve => {
        // This happens when a page was not found
        if (!store) {
          return resolve();
        }

        const matches = store.match(
          undefined,
          namedNode('http://vocab.datex.org/terms#parkingNumberOfVacantSpaces')
        );

        matches.on('data', match => {
          const time = match.graph.id.split(`${baseUri}?time=`)[1];
          const parking = match.subject.id.replace(`${baseUri}#`, '');
          const numberOfVacantSpaces = parseInt(
            match.object.id.split('"').join('')
          );

          if (parkings[parking]) {
            parkings[parking].write(`${time};${numberOfVacantSpaces}\n`);
          }
        });

        matches.on('end', () => resolve());
      });
    });

    // Because we need to ensure sequence, we wait for all writings to be done
    await Promise.all(storePromises);

    // Add one day to the date
    date.setTime(date.getTime() + 24 * 60 * 60 * 1000);
  }
};

main();
