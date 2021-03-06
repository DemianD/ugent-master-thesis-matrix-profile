import fs from 'fs';
import N3 from 'n3';
import it from 'ava';
import sinon from 'sinon';

import { Domain, HydraStorage, CommunicationManager } from '../../index.js';
import { SOSA, RDF, XSD } from '../../src/utils/vocs.js';

const { quad, namedNode, literal } = N3.DataFactory;

const domain = new Domain('https://www.example.com');
const foi1 = domain.addFeatureOfInterest('Feature1');
const op1 = foi1.addObservableProperty(namedNode('ObservableProperty1'));

const currentDate = new Date(Date.UTC(2020, 3, 1, 10, 30, 45, 909));

it('should create a new page if the directory does not exists', t => {
  const communicationManager = new CommunicationManager();

  const existsSyncMock = sinon.stub(fs, 'existsSync').returns(false);
  const mkdirSyncMock = sinon.stub(fs, 'mkdirSync');
  const readdirSyncMock = sinon.stub(fs, 'readdirSync').returns([]);

  const stream = { write: () => {} };

  const streamSpy = sinon.spy(stream, 'write');
  const createWriteStreamMock = sinon.stub(fs, 'createWriteStream').returns(stream);

  const clock = sinon.useFakeTimers(currentDate);

  const storage = new HydraStorage(op1, communicationManager, null, {
    dataPath: './hydra-storage-test',
    observationsPerPage: 2
  });

  storage.boot();

  t.true(existsSyncMock.calledWith('./hydra-storage-test'));
  t.true(mkdirSyncMock.calledWith('./hydra-storage-test'));
  t.true(readdirSyncMock.calledWith('./hydra-storage-test'));

  t.is(
    createWriteStreamMock.getCall(0).firstArg,
    './hydra-storage-test/2020-04-01T10:30:45.909Z.ttl'
  );

  t.snapshot(
    streamSpy
      .getCalls()
      .map(call => call.args[0])
      .join('\n')
  );

  streamSpy.restore();
  existsSyncMock.restore();
  mkdirSyncMock.restore();
  readdirSyncMock.restore();
  createWriteStreamMock.restore();
  clock.restore();
});

it('should reopen the latest file if a file exits and set the remaining observations', t => {
  const communicationManager = new CommunicationManager();

  const existsSyncMock = sinon.stub(fs, 'existsSync').returns(true);
  const readdirSyncMock = sinon.stub(fs, 'readdirSync').returns(['2020-04-01T09:30:45.909Z.ttl']);
  const readFileSyncMock = sinon
    .stub(fs, 'readFileSync')
    .returns(
      `${SOSA('Observation').value}, ${SOSA('Observation').value}, ${SOSA('Observation').value}`
    );

  const createWriteStreamMock = sinon.stub(fs, 'createWriteStream');

  const storage = new HydraStorage(op1, communicationManager, null, {
    dataPath: './hydra-storage-test',
    observationsPerPage: 10
  });

  storage.boot();

  t.true(readFileSyncMock.calledWith('./hydra-storage-test/2020-04-01T09:30:45.909Z.ttl'));

  t.is(
    createWriteStreamMock.getCall(0).firstArg,
    './hydra-storage-test/2020-04-01T09:30:45.909Z.ttl'
  );

  t.is(storage.remainingObservations, 7);

  createWriteStreamMock.restore();
  readFileSyncMock.restore();
  readdirSyncMock.restore();
  existsSyncMock.restore();
});

it('should create a new file when a new observation is added and the current file is full', t => {
  const domain = new Domain('https://www.example.com');
  const foi1 = domain.addFeatureOfInterest('Feature1');
  const op1 = foi1.addObservableProperty(namedNode('ObservableProperty1'));

  const communicationManager = new CommunicationManager();

  const existsSyncMock = sinon.stub(fs, 'existsSync').returns(true);
  const readdirSyncMock = sinon.stub(fs, 'readdirSync').returns(['2020-04-01T09:30:45.909Z.ttl']);
  const readFileSyncMock = sinon.stub(fs, 'readFileSync').returns(SOSA('Observation').value);

  const currentPageStream = { write: () => {}, end: () => {} };
  const newPageStream = { write: () => {}, end: () => {} };

  const currentPageStreamSpy = sinon.spy(currentPageStream, 'write');
  const newPageStreamSpy = sinon.spy(newPageStream, 'write');

  const createWriteStreamMock = sinon
    .stub(fs, 'createWriteStream')
    .onFirstCall()
    .returns(currentPageStream)
    .onSecondCall()
    .returns(newPageStream);

  const storage = new HydraStorage(op1, communicationManager, null, {
    dataPath: './hydra-storage-test',
    observationsPerPage: 2
  });

  storage.boot();

  const clock = sinon.useFakeTimers(new Date(currentDate.getTime() + 1000 * 60 * 60 + 91));

  const subject = namedNode(
    'https://www.example.com/Feature1/ObservableProperty1/member/2020-04-01T11:30:46.000Z.ttl'
  );

  const store = new N3.Store([
    quad(subject, RDF('type'), SOSA('Observation')),
    quad(subject, SOSA('hasSimpleResult'), literal(123, XSD('integer'))),
    quad(
      subject,
      SOSA('resultTime'),
      literal(new Date(currentDate.getTime() + 1000 * 60 * 60 + 91).toISOString(), XSD('dateTime'))
    )
  ]);

  storage.addObservation(store);

  t.is(
    createWriteStreamMock.getCall(1).args[0],
    './hydra-storage-test/2020-04-01T11:30:46.000Z.ttl'
  );

  t.is(storage.remainingObservations, 2);

  t.snapshot(
    currentPageStreamSpy
      .getCalls()
      .map(call => call.args[0])
      .join('\n')
  );

  t.snapshot(
    newPageStreamSpy
      .getCalls()
      .map(call => call.args[0])
      .join('\n')
  );

  clock.restore();
  createWriteStreamMock.restore();
  newPageStreamSpy.restore();
  currentPageStreamSpy.restore();
  readFileSyncMock.restore();
  readdirSyncMock.restore();
  existsSyncMock.restore();
});
