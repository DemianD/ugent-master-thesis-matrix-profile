import { DataFactory } from 'n3';

const { namedNode } = DataFactory;

export const SOSA = (name) => {
  return namedNode(`http://www.w3.org/ns/sosa/${name}`);
};

export const RDF = (name) => {
  return namedNode(`http://www.w3.org/1999/02/22-rdf-syntax-ns#${name}`);
};

export const XSD = (name) => {
  return namedNode(`http://www.w3.org/2001/XMLSchema#${name}`);
};

export const HYDRA = (name) => {
  return namedNode(`http://www.w3.org/ns/hydra/core#${name}`);
};

export const TREE = (name) => {
  return namedNode(`https://w3id.org/tree#${name}`);
};

export const VOID = (name) => {
  return namedNode(`http://rdfs.org/ns/void#${name}`);
};

export const DATEX = (name) => {
  return namedNode(`http://vocab.datex.org/terms#${name}`);
};

export const MP = (name) => {
  return namedNode(`http://www.example.com/matrix-profile#${name}`);
};
