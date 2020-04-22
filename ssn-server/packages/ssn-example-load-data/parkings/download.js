import N3 from 'n3';
import fs from 'fs';

import { fetch, storeQuads, datetimeToString, createDirectoryIfNotExists } from '../utils.js';
const { namedNode } = N3.DataFactory;

class Download {
  constructor(parkingsCity, fromDate, toDate) {
    this.folder = parkingsCity.folder;
    this.baseUri = parkingsCity.baseUri;
    this.parkings = parkingsCity.parkings;

    this.date = new Date(fromDate.getTime());
    this.toDate = toDate;

    createDirectoryIfNotExists(this.folder);

    Object.keys(this.parkings).forEach(parking => {
      this.parkings[parking] = fs.createWriteStream(`${this.folder}/${parking}.csv`, {
        flags: 'wx'
      });

      this.parkings[parking].write('date;value\n');
    });
  }

  async download() {
    let page = `${this.baseUri}?page=${datetimeToString(this.date, '-')}`;

    while (page) {
      console.log(page);
      const store = new N3.Store();

      await fetch(page)
        .then(async response => {
          if (response.status === 404) {
            // Sometimes the next link is broken
            // so we fix this by searching manually for the next link
            console.error('err:', page);
            console.log('Trying to recover');

            const datetimeString = page.match(/(.*)?page=(.*)/)[2];
            const [date, time] = datetimeString.split('T');
            const [year, month, day] = date.split('-');
            const [hour, minute, second] = time.split(':');

            const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

            while (true) {
              utcDate.setUTCHours(utcDate.getUTCHours() + 1);

              page = `${this.baseUri}?page=${datetimeToString(utcDate, '-')}`;

              const response = await fetch(page);

              if (response.status !== 404) {
                console.log('recovered');
                return response.text();
              }
            }
          }
          return response.text();
        })
        .then(data => storeQuads(store, data))
        .catch(err => console.error(err, page));

      await new Promise(resolve => {
        const matches = store.match(
          undefined,
          namedNode('http://vocab.datex.org/terms#parkingNumberOfVacantSpaces')
        );

        const next = store.getObjects(
          undefined,
          namedNode('http://www.w3.org/ns/hydra/core#next')
        )[0];

        matches.on('data', match => {
          const time = match.graph.id.split(`${this.baseUri}?time=`)[1];
          const parking = match.subject.id.replace(`${this.baseUri}#`, '');
          const numberOfVacantSpaces = parseInt(match.object.id.split('"').join(''));

          if (this.parkings[parking]) {
            this.parkings[parking].write(`${time};${numberOfVacantSpaces}\n`);
          }
        });

        page = next && next.value;

        matches.on('end', () => resolve());
      });

      // Add one day to the date
      this.date.setTime(this.date.getTime() + 24 * 60 * 60 * 1000);
    }
  }
}

export default Download;
