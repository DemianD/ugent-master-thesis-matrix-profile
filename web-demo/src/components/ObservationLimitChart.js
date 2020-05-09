import React from 'react';
import { useMemo } from 'react';
import { GREATER_THAN_OR_EQUAL_TO, LESS_THAN_OR_EQUAL_TO } from '../query/Query';
import useTreeQuery from '../hooks/useTreeQuery';
import useHydraQuery from '../hooks/useHydraQuery';
import mapObservation from '../utils/mapObservations';
import ChartDetail from './ChartDetail';

const ObservationLimitChart = ({ collectionSubject, startDate, limit }) => {
  const motifFirstObservationFilter = useMemo(() => {
    return [
      {
        relationType: GREATER_THAN_OR_EQUAL_TO,
        value: new Date(startDate),
      },
      {
        relationType: LESS_THAN_OR_EQUAL_TO,
        value: new Date(startDate),
      },
    ];
  }, [startDate]);

  const motifObservationFilter = useMemo(() => {
    return [
      {
        relationType: GREATER_THAN_OR_EQUAL_TO,
        value: new Date(startDate),
      },
    ];
  }, [startDate]);

  // Fetching first observation of the motif,
  // then follow the next links until enough observations
  const { observations } = useTreeQuery(collectionSubject, motifFirstObservationFilter, true, true);
  const firstObservation = observations && observations.length && observations[0];

  const { observations: nextObservations } = useHydraQuery(
    firstObservation && firstObservation.__meta.datasource,
    motifObservationFilter,
    !!firstObservation,
    limit
  );

  const datapoints = useMemo(() => {
    return (nextObservations || []).map(mapObservation);
  }, [nextObservations]);

  if (!datapoints || !datapoints.length) {
    return null;
  }

  return <ChartDetail height={200} className="h-48 bg-red-200" datapoints={datapoints} />;
};

export default ObservationLimitChart;
