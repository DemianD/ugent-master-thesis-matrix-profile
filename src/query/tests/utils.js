import fs from 'fs';
import util from 'util';
import nock from 'nock';

const readFile = util.promisify(fs.readFile);

export const mockRequests = () => {
  const calls = [];

  nock('https://example.com/')
    .persist()
    .get(/^(?!\/node\/.*$).*/)
    .reply(
      200,
      (uri) => {
        calls.push(uri);
        const pageName = uri.replace('/', '') || 'root';
        return readFile(`./src/query/tests/test-data/${pageName}.ttl`, 'utf8');
      },
      {
        'Content-Type': 'application/trig',
        'Cache-Control': 'no-cache',
      }
    );

  nock('https://example.com/')
    .persist()
    .get(/node\/.*/)
    .reply(
      200,
      (uri) => {
        calls.push(uri);
        const pageName = uri.replace('/node/', '') || 'root';
        return readFile(`./src/query/tests/test-data/${pageName}.ttl`, 'utf8');
      },
      {
        'Content-Type': 'application/trig',
        'Cache-Control': 'no-cache',
      }
    );

  return [() => calls, () => nock.cleanAll()];
};

export const waitForResults = (timesCalled) => {
  const results = [];

  let called = 0;
  let resolve;

  const onData = (event, data) => {
    results.push(data);

    if (event === 'observations') {
      called++;
    }

    if (called === timesCalled) {
      resolve();
    }
  };

  return [
    new Promise((innerResolve) => {
      resolve = innerResolve;
    }),
    onData,
    () => results,
  ];
};
