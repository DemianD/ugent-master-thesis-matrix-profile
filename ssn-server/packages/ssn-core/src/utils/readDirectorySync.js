import fs from 'fs';

const readDirectorySync = (directoryName, suffix) => {
  const files = fs.readdirSync(directoryName);

  // readdirSync lists the files in order, except on Windows.
  return files.filter(file => file.endsWith(suffix)).sort();
};

export default readDirectorySync;
