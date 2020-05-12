import N3 from 'n3';

const { namedNode } = N3.DataFactory;

export const SOSA = name => {
  return namedNode(`http://www.w3.org/ns/sosa/${name}`);
};

export const RDF = name => {
  return namedNode(`http://www.w3.org/1999/02/22-rdf-syntax-ns#${name}`);
};

export const XSD = name => {
  return namedNode(`http://www.w3.org/2001/XMLSchema#${name}`);
};

export const OWL = name => {
  return namedNode(`http://www.w3.org/2002/07/owl#${name}`);
};

export const DATEX = name => {
  return namedNode(`http://vocab.datex.org/terms#${name}`);
};

export const RDFS = name => {
  return namedNode(`http://www.w3.org/2000/01/rdf-schema#${name}`);
};

export const PROV = name => {
  return namedNode(`http://www.w3.org/ns/prov#${name}`);
};

export const MP = name => {
  return namedNode(`http://www.example.com/matrix-profile#${name}`);
};

export const HYDRA = name => {
  return namedNode(`http://www.w3.org/ns/hydra/core#${name}`);
};

export const OBSERVABLE_PROPERTY = name => {
  return namedNode(`https://mp-server.dem.be/observable-properties/${name}`);
};
