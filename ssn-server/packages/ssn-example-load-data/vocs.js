import N3 from 'n3';

const { namedNode } = N3.DataFactory;

export const DATEX = name => {
  return namedNode(`http://vocab.datex.org/terms#${name}`);
};

export const OBSERVABLE_PROPERTY = name => {
  return namedNode(`https://mp-server.dem.be/observable-properties/${name}`);
};
