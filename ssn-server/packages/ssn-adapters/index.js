import SourceReader from './src/readers/SourceReader.js';
import HydraPreviousNextStorage from './src/storage/HydraPreviousNextStorage.js';
import WebServer from './src/accessors/WebServer.js';
import * as exceptions from './src/exceptions/index.js';

export const Readers = {
  SourceReader
};

export const Storage = {
  HydraPreviousNextStorage
};

export const Accessors = {
  WebServer
};

export const Exceptions = {
  ...exceptions
};

export default {
  Readers,
  Storage,
  Accessors,
  Exceptions
};
