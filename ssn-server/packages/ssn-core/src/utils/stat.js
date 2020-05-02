import fs from 'fs';
import { promisify } from 'util';
import { NotFoundException } from '../exceptions/index.js';

const fsStat = promisify(fs.stat);

const stat = path => {
  return fsStat(path).catch(err => {
    if (err.code === 'ENOENT') {
      throw new NotFoundException();
    } else {
      throw err;
    }
  });
};

export default stat;
