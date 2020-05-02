import fs from 'fs';
import { TimeSeriesTree, LDDisk } from 'timeseries-tree';

import HydraStorage from './HydraStorage.js';
import createDirectoryIfNotExists from '../utils/createDirectoryIfNotExistsSync.js';
import { SOSA } from '../utils/vocs.js';
import getRelativeURI from '../utils/getRelativeURI.js';
import sanitizeFilename from '../communication/utils/sanitizeFilename.js';
import stat from '../utils/stat.js';

class BPlusTreeStorage extends HydraStorage {
  constructor(observableProperty, communicationManager, options) {
    super(observableProperty, communicationManager, options);

    if (!options.degree) {
      throw new Error('No degree specified');
    }

    if (!options.nodesPath) {
      throw new Error('No nodesPath specified');
    }

    this.degree = options.degree;
    this.nodesPath = options.nodesPath;
  }

  boot() {
    createDirectoryIfNotExists(this.nodesPath);

    const disk = new LDDisk(
      this.nodesPath,
      this.degree,
      SOSA('resultTime'),
      this.collection.getSubject().id
    );

    this.tree = new TimeSeriesTree(disk, this.degree);

    super.boot();
  }

  createNewPage() {
    const newPageName = super.createNewPage();

    this.tree.insert(newPageName, newPageName);
  }

  async getNodePage({ pageName: originalPageName }) {
    const pageName = sanitizeFilename(this.nodesPath, originalPageName);
    const stats = await stat(pageName);

    return {
      immutable: false,
      body: fs.createReadStream(pageName),
      headers: {
        'Content-Length': stats.size,
        'Last-Modified': stats.mtime
      }
    };
  }

  registerEndpoints() {
    const relativeURI = getRelativeURI(this.collection.getSubject().id);

    this.communicationManager.addEndpoints({
      [`${relativeURI}`]: () => this.getNodePage({ pageName: 'root' }),
      [`${relativeURI}/node`]: () => this.getNodePage({ pageName: 'root' }),
      [`${relativeURI}/node/:pageName`]: params => this.getNodePage(params),
      [`${relativeURI}/latest`]: params => this.getLatestPage(params),
      [`${relativeURI}/:pageName`]: params => this.getPage(params)
    });
  }
}

export default BPlusTreeStorage;
