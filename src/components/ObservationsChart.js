import React, { useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import useTreeQuery from '../hooks/useTreeQuery';
import ExampleChart from './Chart';
import { SOSA } from '../utils/vocs';

const ObservationsChart = ({ subject, filters }) => {
  const observations = useTreeQuery(subject, filters);

  const [debouncedObservations] = useDebounce(observations, 1000);

  const datapoints = useMemo(() => {
    return (debouncedObservations || [])
      .map((result) => {
        return [
          new Date(result[SOSA('resultTime').value].value).getTime(),
          parseInt(result[SOSA('hasSimpleResult').value].value),
        ];
      })
      .sort((a, b) => a[0] - b[0]);
  }, [debouncedObservations]);

  return (
    <>
      <div>Number of observations: {observations.length}</div>
      {datapoints.length > 0 && <ExampleChart className="mt-4" dataPoints={datapoints} />}
    </>
  );
};

export default ObservationsChart;
