import fs from 'fs';
import util from 'util';

const readFile = util.promisify(fs.readFile);

export const mockFetch = () => {
  return jest.spyOn(window, 'fetch').mockImplementation((url) => {
    const page = url.replace('https://www.example.com/', '').split(':').join('_') || 'root';

    return Promise.resolve({
      text: () => readFile(`./src/query/tests/pages/${page}.ttl`, 'utf8'),
    });
  });
};

export const waitForResults = (timesCalled) => {
  let called = 0;
  let resolve;
  const onData = () => {
    called++;

    if (called === timesCalled) {
      resolve();
    }
  };

  return [
    new Promise((innerResolve) => {
      resolve = innerResolve;
    }),
    onData,
  ];
};
