import N3 from 'n3';

const streamQuads = (quads, outputStream, end = true, format = 'application/trig') => {
  const streamWriter = new N3.StreamWriter({ format });
  streamWriter.pipe(outputStream);

  quads.forEach(quad => streamWriter.write(quad));

  if (end) {
    streamWriter.end();
  } else {
    // streamWriter.end() will close the outputStream. This is something that we don't
    // always want to happen. To fix this, we just flush the remaining data and
    // close only the streamWriter.
    if (streamWriter._writer._subject !== null) {
      streamWriter._writer._write(streamWriter._writer._inDefaultGraph ? '.\n' : '\n}\n');
      streamWriter._writer._subject = null;
    }

    // Disallow further writing
    streamWriter._writer._write = streamWriter._writer._blockedWrite;
  }
};

export default streamQuads;
