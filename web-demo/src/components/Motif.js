import React from 'react';
import ObservationLimitChart from './ObservationLimitChart';

const Motif = ({ collectionSubject, motif, match, windowSize }) => {
  return (
    <>
      <ObservationLimitChart
        collectionSubject={collectionSubject}
        startDate={motif}
        limit={windowSize}
      />
      <ObservationLimitChart
        collectionSubject={collectionSubject}
        startDate={match}
        limit={windowSize}
      />
    </>
  );
};

export default Motif;
