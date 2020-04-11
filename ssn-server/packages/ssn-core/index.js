import DomainX from './src/domain/Domain.js';
import CommunicationManagerX from './src/communication/CommunicationManager.js';
import SourceReader from './src/readers/SourceReader.js';
import HydraPreviousNextStorage from './src/interfaces/HydraPreviousNextStorage.js';
import TreeStorage from './src/interfaces/TreeStorage.js';
import CatalogInterface from './src/interfaces/CatalogInterface.js';

import * as exceptions from './src/exceptions/index.js';

export const Domain = DomainX;
export const CommunicationManager = CommunicationManagerX;

export const Readers = {
  SourceReader
};

export const Interfaces = {
  CatalogInterface,
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
  Exceptions,
  CommunicationManager
};
