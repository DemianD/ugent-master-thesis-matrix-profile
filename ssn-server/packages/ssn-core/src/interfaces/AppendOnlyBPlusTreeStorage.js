import fs from 'fs';
import { AppendOnlyBPlusTree, LDDisk } from 'append-only-bplus-tree';

import HydraStorage from './HydraStorage.js';
import createDirectoryIfNotExists from '../utils/createDirectoryIfNotExistsSync.js';
import { SOSA } from '../utils/vocs.js';
import getRelativeURI from '../utils/getRelativeURI.js';
import sanitizeFilename from '../communication/utils/sanitizeFilename.js';
import stat from '../utils/stat.js';
import TreeCollection from '../collections/TreeCollection.js';

class AppendOnlyBPlusTreeStorage extends HydraStorage {
  constructor(observableProperty, communicationManager, options) {
    super(
      observableProperty,
      communicationManager,
      new TreeCollection(observableProperty),
      options
    );

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

    this.tree = new AppendOnlyBPlusTree(disk, this.degree);

    super.boot();
  }

  createNewPage(newPageName) {
    super.createNewPage(newPageName);

    this.tree.insert(newPageName, newPageName);
  }

  async getNodePage({ pageName: originalPageName }) {
    const pageName = sanitizeFilename(this.nodesPath, originalPageName);
    const stats = await stat(pageName);

    // If the node is on the path, the file is not immutable.
    // TODO: this is not always true. E.g. calculating of summaries for nodes
    // that are not on the path (because they are just split)
    const node = this.tree.path.find(node => node.nodeNumber === originalPageName);

    return {
      immutable: node ? false : true,
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

export default AppendOnlyBPlusTreeStorage;
