import { Stream } from 'stream';

const isReadableStream = obj => {
  return (
    obj instanceof Stream &&
    typeof obj._read === 'function' &&
    typeof obj._readableState === 'object'
  );
};

export default isReadableStream;
