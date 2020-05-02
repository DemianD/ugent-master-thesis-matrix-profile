import { TimeSeriesTree, LDDisk } from 'timeseries-tree';
import HydraStorage from './HydraStorage.js';
import createDirectoryIfNotExists from '../utils/createDirectoryIfNotExistsSync.js';
import { SOSA } from '../utils/vocs.js';

class BPlusTreeStorage extends HydraStorage {
  constructor(observableProperty, communicationManager, options) {
    super(observableProperty, communicationManager, options);

    if (!options.degree) {
      throw new Error('No degree specified');
    }

    if (!options.indexNodesFolder) {
      throw new Error('No indexNodesFolder specified');
    }
  }

  boot() {
    createDirectoryIfNotExists(options.indexNodesFolder);
    const disk = new LDDisk(options.indexNodesFolder, options.degree, SOSA('resultTime'));

    this.tree = new TimeSeriesTree(disk, options.degree);

    super.boot();
  }

  createNewPage() {
    const newPageName = super.createNewPage();

    this.tree.insert(newPageName, newPageName);
  }
}

export default BPlusTreeStorage;
