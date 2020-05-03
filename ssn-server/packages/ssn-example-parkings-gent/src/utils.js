import { exec as execCb } from 'child_process';

export const exec = cmd => {
  return new Promise((resolve, reject) => {
    execCb(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
      }
      resolve(stdout ? stdout : stderr);
    });
  });
};
