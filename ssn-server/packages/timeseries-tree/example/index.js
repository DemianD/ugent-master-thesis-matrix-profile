import N3 from 'n3';

import TimeSeriesTree from '../src/TimeSeriesTree.js';
import LDDisk from '../src/disks/LDDisk.js';

const { namedNode } = N3.DataFactory;

const SOSA = name => {
  return namedNode(`http://www.w3.org/ns/sosa/${name}`);
};

const disk = new LDDisk('./data', 5, SOSA('resultTime'));
const tree = new TimeSeriesTree(disk, 5);

const date = Date.UTC(2020, 4, 1, 16, 0, 0, 0);

(async () => {
  for (let i = 0; i < 50; i++) {
    const isoDate = new Date(date + 1000 * 60 * 5 * i).toISOString();

    await tree.insert(isoDate, isoDate);
  }
})();
