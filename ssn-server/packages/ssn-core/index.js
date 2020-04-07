import DomainD from './src/domain/Domain.js';
import SourceReader from './src/readers/SourceReader.js';
import HydraPreviousNextStorage from './src/interfaces/HydraPreviousNextStorage.js';
import TreeStorage from './src/interfaces/TreeStorage.js';

import * as exceptions from './src/exceptions/index.js';

export const Domain = DomainD;

export const Readers = {
  SourceReader
};

export const Interfaces = {
  HydraPreviousNextStorage,
  TreeStorage
};

export const Exceptions = {
  ...exceptions
};

export default {
  Domain,
  Readers,
  Interfaces,
  Exceptions
};
