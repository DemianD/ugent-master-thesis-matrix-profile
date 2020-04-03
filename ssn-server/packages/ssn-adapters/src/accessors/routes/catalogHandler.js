import { NO_CACHE } from '../constants';

export const catalogHandler = domain => {
  return {
    cache: NO_CACHE,
    body: domain.catalog()
  };
};
