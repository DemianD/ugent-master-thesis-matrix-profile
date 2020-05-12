import fs from 'fs';
import { pad, fetch } from '../utils.js';

const startDate = new Date('2019-01-19');
const endDate = new Date();

// http://archive.luftdaten.info/2020-05-10/2020-05-10_sds011_sensor_21136.csv
const download = async sensorId => {
  let i = 0;
  let currentDate = new Date(startDate.getTime());

  const writeStream = fs.createWriteStream(`./data/${sensorId}.csv`, {
    flags: 'wx'
  });

  writeStream.write('date;P1;P2\n');

  while (currentDate <= endDate) {
    const date = `${currentDate.getFullYear()}-${pad(currentDate.getMonth() + 1)}-${pad(
      currentDate.getDate()
    )}`;

    const url = `http://archive.luftdaten.info/${date}/${date}_sds011_sensor_${sensorId}.csv`;
    console.log(url);

    const response = await fetch(url);

    if (response.status === 200) {
      const csv = await response.text();
      const lines = csv.split('\n');

      lines.shift(); // headers
      lines.pop(); // new line

      lines.forEach(line => {
        const [
          sensor_id,
          sensor_type,
          location,
          lat,
          lon,
          timestamp,
          P1,
          durP1,
          ratioP1,
          P2,
          durP2,
          ratioP2
        ] = line.split(';');

        writeStream.write(`${timestamp};${P1};${P2}\n`);
      });
    }

    // Set the next currentDate
    currentDate = new Date(startDate.getTime() + ++i * 24 * 60 * 60 * 1000);
  }
};

download('8777');
// download('12030');
