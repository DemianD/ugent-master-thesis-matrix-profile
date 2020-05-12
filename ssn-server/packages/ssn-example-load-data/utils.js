import { exec as execCb } from 'child_process';
import fs from 'fs';
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
  return `${date.getFullYear()}${sep}${pad(date.getMonth() + 1)}${sep}${pad(date.getDate())}`;
};

export const datetimeToString = (date, sep) => {
  console.log(date.toString());
  console.log(date.toISOString());
  // Without milliseconds
  return date.toISOString().split('.')[0];

  return `${date.getFullYear()}${sep}${pad(date.getMonth() + 1)}${sep}${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

export const createDirectoryIfNotExists = directoryName => {
  if (fs.existsSync(directoryName)) {
    return;
  }

  fs.mkdirSync(directoryName, {
    recursive: true
  });
};

export const exec = cmd => {
  return new Promise((resolve, reject) => {
    execCb(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
      }
      resolve(stdout ? stdout : stderr);
    });
  });
};

export const sleep = ms => new Promise(resolve => setTimeout(() => resolve(), ms));
