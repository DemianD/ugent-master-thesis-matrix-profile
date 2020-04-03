import N3 from 'n3';

const streamQuads = (quads, outputStream, format) => {
  const streamWriter = new N3.StreamWriter({ format });
  streamWriter.pipe(outputStream);

  quads.forEach(quad => streamWriter.write(quad));
  streamWriter.end();
};

export default streamQuads;
