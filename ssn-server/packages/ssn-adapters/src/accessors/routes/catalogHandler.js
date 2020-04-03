import { NO_CACHE } from '../constants.js';

export const catalogHandler = domain => {
  return {
    cache: NO_CACHE,
    body: domain.catalog()
  };
};
