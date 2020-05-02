import path from 'path';

const sanitizeFilename = (folder, file) => {
  const safeSuffix = path.normalize(file).replace(/^(\.\.[\/\\])+/, '');
  return path.join(folder, safeSuffix);
};

export default sanitizeFilename;
