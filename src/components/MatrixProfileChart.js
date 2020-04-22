import React, { useMemo, useEffect, useState } from 'react';
import useComunica from '../hooks/useComunica';
import { getMatrixProfile } from '../queries';
import Chart from './Chart';

const restoreIndividual = (string, TypedArray) => {
  return new Promise((resolve) => {
    const buf = new ArrayBuffer(string.length * 2); // 2 bytes for each char
    const uint16Array = new Uint16Array(buf);

    const stringLength = string.length;

    for (let i = 0; i < stringLength; i++) {
      uint16Array[i] = string.charCodeAt(i);
    }

    const worker = new Worker('restoreMatrixProfile.js');
    worker.postMessage(uint16Array.buffer, [uint16Array.buffer]);

    worker.onmessage = (e) => {
      resolve(new TypedArray(e.data));
    };
  });
};

const restoreMatrixProfile = (dates, distances, indexes) => {
  return Promise.all([
    restoreIndividual(dates, Uint32Array),
    restoreIndividual(distances, Float32Array),
  ]).then(([dates, distances]) => {
    const result = [];
    const length = dates.length;

    for (let i = 0; i < length; i++) {
      result.push([dates[i] * 1000, distances[i]]);
    }

    return result;
  });
};

const MatrixProfileChart = ({ subject, filters, fromDate, toDate }) => {
  const [datapoints, setDatapoints] = useState([]);
  const [matrixProfiles] = useComunica(subject, getMatrixProfile, true);

  const matrixProfile = matrixProfiles.length && matrixProfiles[0];

  useEffect(() => {
    if (matrixProfile) {
      restoreMatrixProfile(
        matrixProfile.get('?dates').value,
        matrixProfile.get('?distances').value,
        matrixProfile.get('?indexes').value
      ).then((d) => {
        setDatapoints(d);
      });
    }
  }, [matrixProfile]);

  if (datapoints.length === 0) {
    return null;
  }

  return (
    <Chart
      className="mt-4"
      dataPoints={datapoints}
      name={`Matrix Profile ${matrixProfile.get('?windowSize').value}`}
      min={fromDate.getTime()}
      max={toDate.getTime()}
    />
  );
};

export default MatrixProfileChart;
