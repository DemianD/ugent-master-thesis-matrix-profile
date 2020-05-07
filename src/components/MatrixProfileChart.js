import React, { useEffect, useState } from 'react';
import useComunica from '../hooks/useComunica';
import { getMatrixProfile } from '../queries';

import restoreMatrixProfile from '../utils/matrix-profile/restore';

import Chart from './Chart';

const MatrixProfileChart = ({ subject, fromDate, toDate }) => {
  const [matrixProfile, setMatrixProfile] = useState();
  const [matrixProfiles] = useComunica(subject, getMatrixProfile, true);

  useEffect(() => {
    const mp = matrixProfiles.length && matrixProfiles[0];

    if (mp) {
      restoreMatrixProfile(
        Number(mp.get('?windowSize').value),
        mp.get('?dates').value,
        mp.get('?distances').value,
        mp.get('?indexes').value
      ).then((restoredMatrixProfile) => {
        setMatrixProfile(restoredMatrixProfile);
      });
    }
  }, [matrixProfiles]);

  if (!matrixProfile || !matrixProfile.data) {
    return null;
  }

  return (
    <Chart
      className="mt-4"
      dataPoints={matrixProfile.data}
      name={`Matrix Profile ${matrixProfile.windowSize}`}
      min={fromDate.getTime()}
      max={toDate.getTime()}
    />
  );
};

export default MatrixProfileChart;
