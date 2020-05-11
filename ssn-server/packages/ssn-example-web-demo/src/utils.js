import { exec as execCb } from 'child_process';

export const exec = cmd => {
  return new Promise((resolve, reject) => {
    execCb(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error, stderr);
      }
      resolve(stdout ? stdout : stderr);
    });
  });
};
