import N3 from 'n3';

const { namedNode } = N3.DataFactory;

export const SOSA = name => {
  return namedNode(`http://www.w3.org/ns/sosa/${name}`);
};

export const MP = name => {
  return namedNode(`http://www.example.com/matrix-profile#${name}`);
};
