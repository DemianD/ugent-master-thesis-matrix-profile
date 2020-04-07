import fs from 'fs';

const createDirectoryIfNotExists = directoryName => {
  if (fs.existsSync(directoryName)) {
    return;
  }

  fs.mkdirSync(directoryName);
};

export default createDirectoryIfNotExists;
