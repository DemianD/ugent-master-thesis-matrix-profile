import N3 from 'n3';
import nodeFetch from 'node-fetch';
import zeitFetch from '@zeit/fetch-retry';

export const fetch = zeitFetch(nodeFetch);

export const pad = n => {
  return n > 9 ? '' + n : '0' + n;
};

export const storeQuads = (store, data) => {
  const parser = new N3.Parser();

  return new Promise((resolve, reject) => {
    parser.parse(data, (error, quad, prefixes) => {
      if (quad) {
        store.addQuad(quad);
      } else if (prefixes) {
        resolve();
      } else if (error) {
        reject(error);
      }
    });
  });
};

export const dateToString = (date, sep) => {
  return `${date.getFullYear()}${sep}${pad(date.getMonth() + 1)}${sep}${pad(
    date.getDate()
  )}`;
};
