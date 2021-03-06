import N3 from 'n3';

const { namedNode } = N3.DataFactory;

export const SOSA = name => {
  return namedNode(`http://www.w3.org/ns/sosa/${name}`);
};

export const MP = name => {
  return namedNode(`http://www.example.com/matrix-profile#${name}`);
};

export const RDF = name => {
  return namedNode(`http://www.w3.org/1999/02/22-rdf-syntax-ns#${name}`);
};

export const XSD = name => {
  return namedNode(`http://www.w3.org/2001/XMLSchema#${name}`);
};
