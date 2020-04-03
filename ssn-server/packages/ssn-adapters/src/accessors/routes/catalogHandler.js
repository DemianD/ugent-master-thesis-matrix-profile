export const catalogHandler = domain => {
  return {
    cache: 'no-cache, no-store, must-revalidate',
    body: domain.catalog()
  };
};
