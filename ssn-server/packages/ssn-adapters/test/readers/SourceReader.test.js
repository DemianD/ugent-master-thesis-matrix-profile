import test from 'ava';
import SourceReader from '../../src/readers/SourceReader.js';
import nock from 'nock';

const interval = '*/5 * * * * *';

const sources = {
  'file1.xml': 'https://example.com/file1.xml',
  'file2.json': 'https://example.com/file2.json'
};

test('it should set the cronjob and sources correctly', t => {
  const x = new SourceReader(sources, interval);

  t.is(x.cron.cronTime.source, interval);
  t.deepEqual(x.sources, sources);
});

test('it should fetch all the sources and return the appropriate format', async t => {
  const scope = nock('https://example.com')
    .get('/file1.xml')
    .reply(200, 'content of file 1')
    .get('/file2.json')
    .reply(200, 'content of file 2');

  const x = new SourceReader(sources, interval);
  const result = await x.fetchSourcesAsync();

  scope.done();

  t.deepEqual(result, {
    'file1.xml': 'content of file 1',
    'file2.json': 'content of file 2'
  });
});

test('it should transform the yarrrml file to rml if present', async t => {
  new SourceReader(sources, interval, {
    file: './test/readers/sourceReader-test.yml',
    jar: './rmlmapper.jar',
    tempFolder: './test/readers/temp',
    removeTempFolders: true
  });

  t.pass();
});
