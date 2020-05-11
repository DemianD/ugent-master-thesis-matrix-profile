import fs from 'fs';
import nodeFetch from 'node-fetch';
import zeitFetch from '@zeit/fetch-retry';

const fetch = zeitFetch(nodeFetch);

const startDate = '2018-01-01 00:00:00Z';
const endDate = '2020-05-11 23:59:59Z';

const main = async () => {
  const { cameras } = await fetch('https://telraam-api.net/v0/cameras').then(x => x.json());

  const segments = cameras.map(segment => segment.segment_id);

  for (let segment of segments) {
    console.log(segment);
    await fetch(`https://telraam-api.net/v0/reports/${segment}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        time_start: startDate,
        time_end: endDate,
        level: 'segments',
        format: 'per-hour'
      })
    })
      .then(x => x.json())
      .then(result => {
        const writeStream = fs.createWriteStream(`./data/${segment}.txt`);
        writeStream.write('date;pct_up;pedestrian;bike;car;lorry\n');

        result.report.forEach(report => {
          writeStream.write(
            `${report.date};${report.pct_up};${report.pedestrian};${report.bike};${report.car};${report.lorry}\n`
          );
        });

        writeStream.close();
      });
  }
};

main();
