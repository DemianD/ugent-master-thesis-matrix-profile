import N3 from 'n3';

const stringifyQuads = (quads, prefixes, format = 'application/trig') => {
  const writer = new N3.Writer({ format, prefixes });

  return writer.quadsToString(quads);
};

export default stringifyQuads;
