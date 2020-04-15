import fs from 'fs';
import N3 from 'n3';
import it from 'ava';
import sinon from 'sinon';
import Domain, { TreeStorage } from '../../index.js';
import { SOSA, RDF, XSD } from '../../src/utils/vocs.js';
import { InvalidDateException, PageNotFoundException } from '../../src/exceptions/index.js';

const { quad, namedNode, literal } = N3.DataFactory;
const currentDate = new Date(Date.UTC(2020, 3, 1, 10, 30, 45, 909));
const dummyCommunicationManager = { addEndpoints: () => {} };

const createNewTreeStorage = () => {
  const domain = new Domain('https://www.example.com');
  const featureOfInterest = domain.addFeatureOfInterest('Feature1');
  const observableProperty = featureOfInterest.addObservableProperty(
    namedNode('ObservableProperty1')
  );

  return new TreeStorage(observableProperty, dummyCommunicationManager, {
    dataPath: './tree-storage-test',
    observationsPerPage: 3
  });
};

const createMocks = (exists = false, readdirFiles = []) => {
  const existsSyncMock = sinon.stub(fs, 'existsSync').returns(exists);
  const mkdirSyncMock = sinon.stub(fs, 'mkdirSync');
  const readdirSyncMock = sinon.stub(fs, 'readdirSync').returns(readdirFiles);

  const readStream = { read: () => {}, pipe: () => {} };
  const readStreamSpy = sinon.spy(readStream, 'read');

  const writeStream = { write: () => {}, end: () => {} };
  const writeStreamSpy = sinon.spy(writeStream, 'write');

  const createWriteStreamMock = sinon
    .stub(fs, 'createWriteStream')
    .onFirstCall()
    .returns(writeStream);

  const createReadStreamMock = sinon.stub(fs, 'createReadStream').returns(readStream);

  const clock = sinon.useFakeTimers(currentDate);

  return {
    existsSyncMock,
    mkdirSyncMock,
    readdirSyncMock,
    readStreamSpy,
    writeStreamSpy,
    createReadStreamMock,
    createWriteStreamMock,
    clock,
    restore: () => {
      existsSyncMock.restore();
      mkdirSyncMock.restore();
      readdirSyncMock.restore();
      readStreamSpy.restore();
      writeStreamSpy.restore();
      createReadStreamMock.restore();
      createWriteStreamMock.restore();
      clock.restore();
    }
  };
};

const streamToString = stream => {
  stream.end();

  const chunks = [];

  return new Promise(resolve => {
    stream.on('data', data => chunks.push(data));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
};

it('should create an intial page when the are no files in the data folder', async t => {
  const { restore, createWriteStreamMock } = createMocks(false, []);

  const { immutable, body } = createNewTreeStorage().getPage({
    pageName: '2020-04-01T10:30:45.909Z'
  });

  // Assure that a new page is created
  t.is(
    createWriteStreamMock.getCall(0).firstArg,
    './tree-storage-test/2020-04-01T10:30:45.909Z.ttl'
  );

  t.is(immutable, false);

  // It should not contain any relations
  t.is(await streamToString(body), '');

  restore();
});

it('should load the existing files from the folder in the tree', async t => {
  const { restore } = createMocks(false, [
    '2020-04-01T10:25:45.909Z.ttl',
    '2020-04-01T10:20:45.909Z.ttl',
    '2020-04-01T10:27:45.909Z.ttl',
    '2020-04-01T10:22:45.909Z.ttl'
  ]);

  // It should read the 2020-04-01T10:27:45.909Z.ttl file and set the
  // remaining observations correctly
  const readFileSyncMock = sinon
    .stub(fs, 'readFileSync')
    .returns(`${SOSA('Observation').value}${SOSA('Observation').value}`);

  const storage = createNewTreeStorage();

  t.is(storage.remainingObservations, 1);
  t.true(readFileSyncMock.calledWith('./tree-storage-test/2020-04-01T10:27:45.909Z.ttl'));
  readFileSyncMock.restore();

  // Should not contain any relations
  const { body: page1 } = storage.getPage({ pageName: '2020-04-01T10:20:45.909Z' });
  t.is(await streamToString(page1), '');

  // Should not contain any relations
  const { body: page4 } = storage.getPage({ pageName: '2020-04-01T10:27:45.909Z' });
  t.is(await streamToString(page4), '');

  // Should be the root and have two relations: one to page 1, and one to page 3
  const { body: page2 } = storage.getPage({ pageName: '2020-04-01T10:22:45.909Z' });
  t.snapshot(await streamToString(page2));

  // Should have one relation on the right to page 4
  const { body: page3 } = storage.getPage({ pageName: '2020-04-01T10:25:45.909Z' });
  t.snapshot(await streamToString(page3));

  restore();
});

it('should return the root page when fetching the index page', async t => {
  const { restore, createReadStreamMock } = createMocks(false, [
    '2020-04-01T10:25:45.909Z.ttl',
    '2020-04-01T10:20:45.909Z.ttl',
    '2020-04-01T10:27:45.909Z.ttl',
    '2020-04-01T10:22:45.909Z.ttl' // Will be the root
  ]);

  const readFileSyncMock = sinon
    .stub(fs, 'readFileSync')
    .returns(`${SOSA('Observation').value}${SOSA('Observation').value}`);

  const storage = createNewTreeStorage();
  storage.getIndexPage();

  readFileSyncMock.restore();

  t.is(
    createReadStreamMock.getCall(0).firstArg,
    './tree-storage-test/2020-04-01T10:22:45.909Z.ttl'
  );

  restore();
});

it('should return the latest page when fetching the latest page', async t => {
  const { restore, createReadStreamMock } = createMocks(false, [
    '2020-04-01T10:25:45.909Z.ttl',
    '2020-04-01T10:20:45.909Z.ttl',
    '2020-04-01T10:27:45.909Z.ttl',
    '2020-04-01T10:22:45.909Z.ttl' // Will be the root
  ]);

  const readFileSyncMock = sinon
    .stub(fs, 'readFileSync')
    .returns(`${SOSA('Observation').value}${SOSA('Observation').value}`);

  const storage = createNewTreeStorage();
  storage.getLatestPage();

  readFileSyncMock.restore();

  t.is(
    createReadStreamMock.getCall(0).firstArg,
    './tree-storage-test/2020-04-01T10:27:45.909Z.ttl'
  );

  restore();
});

it('should throw an error when the pagename is not a valid date', t => {
  const { restore, createReadStreamMock } = createMocks(false, [
    '2020-04-01T10:25:45.909Z.ttl',
    '2020-04-01T10:20:45.909Z.ttl',
    '2020-04-01T10:27:45.909Z.ttl',
    '2020-04-01T10:22:45.909Z.ttl'
  ]);

  const readFileSyncMock = sinon
    .stub(fs, 'readFileSync')
    .returns(`${SOSA('Observation').value}${SOSA('Observation').value}`);

  const storage = createNewTreeStorage();

  t.throws(() => storage.getPage({ pageName: '../../.env' }), {
    instanceOf: InvalidDateException
  });

  readFileSyncMock.restore();
  restore();
});

it('should throw an error when the page does not exist', t => {
  const { restore, createReadStreamMock } = createMocks(false, [
    '2020-04-01T10:25:45.909Z.ttl',
    '2020-04-01T10:20:45.909Z.ttl',
    '2020-04-01T10:27:45.909Z.ttl',
    '2020-04-01T10:22:45.909Z.ttl'
  ]);

  const readFileSyncMock = sinon
    .stub(fs, 'readFileSync')
    .returns(`${SOSA('Observation').value}${SOSA('Observation').value}`);

  const storage = createNewTreeStorage();

  t.throws(() => storage.getPage({ pageName: '2020-04-01T10:26:45.909Z' }), {
    instanceOf: PageNotFoundException
  });

  readFileSyncMock.restore();
  restore();
});

it('should add an observation without creating a new page', t => {
  const { restore, writeStreamSpy } = createMocks(false, [
    '2020-04-01T10:25:45.909Z.ttl',
    '2020-04-01T10:20:45.909Z.ttl',
    '2020-04-01T10:27:45.909Z.ttl',
    '2020-04-01T10:22:45.909Z.ttl'
  ]);

  const readFileSyncMock = sinon.stub(fs, 'readFileSync').returns(`${SOSA('Observation').value}`);

  const storage = createNewTreeStorage();

  const subject = namedNode(
    'https://www.example.com/Feature1/ObservableProperty1/member/2020-04-01T11:30:45.909Z.ttl'
  );

  storage.addObservation(
    new N3.Store([
      quad(subject, RDF('type'), SOSA('Observation')),
      quad(subject, SOSA('hasSimpleResult'), literal(123, XSD('integer')))
    ])
  );

  t.is(storage.remainingObservations, 1);

  t.snapshot(
    writeStreamSpy
      .getCalls()
      .map(call => call.firstArg)
      .join('\n')
  );

  readFileSyncMock.restore();

  restore();
});

it('should create a new page when adding a new observation', t => {
  const { restore, createWriteStreamMock, createReadStreamMock } = createMocks(false, [
    '2020-04-01T10:25:45.909Z.ttl',
    '2020-04-01T10:20:45.909Z.ttl',
    '2020-04-01T10:27:45.909Z.ttl',
    '2020-04-01T10:22:45.909Z.ttl'
  ]);

  const newWriteStream = { write: () => {}, end: () => {} };
  const newWriteStreamSpy = sinon.spy(newWriteStream, 'write');

  createWriteStreamMock.onSecondCall().returns(newWriteStream);

  const readFileSyncMock = sinon
    .stub(fs, 'readFileSync')
    .returns(`${SOSA('Observation').value}`.repeat(2));

  const storage = createNewTreeStorage();

  const subject = namedNode(
    'https://www.example.com/Feature1/ObservableProperty1/member/2020-04-01T11:30:45.909Z.ttl'
  );

  storage.addObservation(
    new N3.Store([
      quad(subject, RDF('type'), SOSA('Observation')),
      quad(subject, SOSA('hasSimpleResult'), literal(123, XSD('integer')))
    ])
  );

  t.is(storage.remainingObservations, 3);

  storage.getLatestPage();

  t.is(
    createReadStreamMock.getCall(0).firstArg,
    './tree-storage-test/2020-04-01T10:30:45.909Z.ttl'
  );

  t.snapshot(
    newWriteStreamSpy
      .getCalls()
      .map(call => call.firstArg)
      .join('\n')
  );

  readFileSyncMock.restore();

  restore();
});
