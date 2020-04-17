import fs from 'fs';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

const createMatrixProfileLiterals = async path => {
  const dates = [];
  const distances = [];
  const indexes = [];

  const file = await readFile(path, { encoding: 'utf-8' });
  const lines = file.split('\n');

  // Remove the last newline
  lines.pop();

  let [previousDate, previousDistance, previousIndex] = lines.shift().split('\t');

  // setMilliseconds returns the number of milliseconds
  previousDate = new Date(previousDate).setMilliseconds(0) / 1000;
  previousIndex = new Date(previousIndex).setMilliseconds(0) / 1000;
  previousDistance = parseFloat(previousDistance);

  dates.push(previousDate);
  indexes.push(previousIndex);
  distances.push(Math.round((previousDistance + Number.EPSILON) * 100) / 100);

  lines.forEach(line => {
    const [date, distance, index] = line.split('\t');

    const dateTemp = new Date(date).setMilliseconds(0) / 1000;
    dates.push(dateTemp - previousDate);
    previousDate = dateTemp;

    const indexTemp = new Date(index).setMilliseconds(0) / 1000;
    indexes.push(indexTemp - previousIndex);
    previousIndex = indexTemp;

    const distanceTemp = parseFloat(distance);

    distances.push(Math.round((distanceTemp - previousDistance + Number.EPSILON) * 100) / 100);
    previousDistance = distanceTemp;
  });

  return { dates: dates.join(','), distances: distances.join(','), indexes: indexes.join(',') };
};

export default createMatrixProfileLiterals;
