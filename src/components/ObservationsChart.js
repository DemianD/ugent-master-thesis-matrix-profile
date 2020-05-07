import React from 'react';

import Chart from './Chart';

const ObservationsChart = ({ name, datapoints, fromDate, toDate }) => {
  if (!datapoints) {
    return null;
  }

  return (
    <>
      <div>Number of datapoints: {datapoints.length}</div>
      {datapoints.length > 0 && <Chart className="mt-4" dataPoints={datapoints} name={name} />}
    </>
  );
};

export default ObservationsChart;
