import fs from 'fs';
import N3 from 'n3';
import cron from 'cron';
import { promisify } from 'util';
import syncRequest from 'request';

import RMLMapperWrapper from '@rmlio/rmlmapper-java-wrapper';
import convertYarrrmlToRML from '../utils/convertYarrrmlToRML.js';

const request = promisify(syncRequest.get);

class SourceReader {
  constructor(sources, refreshInterval, mapping) {
    this.sources = sources;

    if (mapping) {
      this.initMapping(mapping);
    }

    // Create a cronjob
    this.cron = new cron.CronJob({
      cronTime: refreshInterval,
      runOnInit: true,
      onTick: () => this.run()
    });
  }

  initMapping(mapping) {
    this.mapping = fs.readFileSync(mapping.file, 'utf-8');

    if (mapping.file.endsWith('.yml')) {
      this.mapping = convertYarrrmlToRML(this.mapping);
    }

    this.mapper = new RMLMapperWrapper(mapping.jar, mapping.tempFolder, mapping.removeTempFolders);
  }

  // Abstract method
  async run() {}

  async fetchSourcesAsync() {
    const results = await Promise.all(
      Object.entries(this.sources).map(([name, url]) => {
        return request(url).then(({ statusCode, body }) => {
          if (statusCode !== 200) {
            throw new Error(statusCode, body);
          }

          return [name, body];
        });
      })
    );

    return Object.fromEntries(results);
  }

  async mapData(data) {
    const { output: quads } = await this.mapper.execute(this.mapping, {
      sources: data,
      asQuads: true,
      generateMetadata: false
    });

    const store = new N3.Store();
    store.addQuads(quads);

    return store;
  }
}

export default SourceReader;
