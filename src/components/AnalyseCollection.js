import React, { useState, useMemo, useEffect } from 'react';
import { H3, H4 } from './Heading';
import useTreeQuery from '../hooks/useTreeQuery';
import { GREATER_THAN_OR_EQUAL_TO, LESS_THAN_OR_EQUAL_TO } from '../query/Query';
import ObservationsChart from './ObservationsChart';
import useComunica from '../hooks/useComunica';
import { getMatrixProfile } from '../queries';
import restore from '../utils/matrix-profile/restore';
import calculateDiscords from '../utils/matrix-profile/discords';
import calculateMotifs from '../utils/matrix-profile/motifs';
import ChartDetail from './ChartDetail';
import { SOSA } from '../utils/vocs';
import applyFilters from '../query/utils/applyFilters';
import Motif from './Motif';
import mapObservation from '../utils/mapObservations';
import ObservationLimitChart from './ObservationLimitChart';

const AnalyseCollection = ({ fromDate, toDate, subject, matrixProfileSubject }) => {
  const filters = useMemo(() => {
    return [
      {
        relationType: GREATER_THAN_OR_EQUAL_TO,
        value: new Date(fromDate),
      },
      {
        relationType: LESS_THAN_OR_EQUAL_TO,
        value: new Date(toDate),
      },
    ];
  }, [fromDate, toDate]);

  const [matrixProfile, setMatrixProfile] = useState();
  const [discords, setDiscords] = useState([]);
  const [motifs, setMotifs] = useState([]);

  const observations = useTreeQuery(subject, filters);

  const datapoints = useMemo(() => {
    return (observations || []).map(mapObservation).sort((a, b) => a[0] - b[0]);
  }, [observations]);

  const matrixProfileDatapoints = useMemo(() => {
    if (matrixProfile && matrixProfile.data) {
      return matrixProfile.data.map(([date, distance]) => [date, distance]);
    }
  }, [matrixProfile]);

  const [matrixProfiles] = useComunica(
    matrixProfileSubject,
    getMatrixProfile,
    !!matrixProfileSubject
  );

  useEffect(() => {
    if (matrixProfiles.length) {
      restore(
        Number(matrixProfiles[0].get('?windowSize').value),
        matrixProfiles[0].get('?dates').value,
        matrixProfiles[0].get('?distances').value,
        matrixProfiles[0].get('?indexes').value
      ).then((restored) => {
        setMatrixProfile(restored);
        setDiscords(
          calculateDiscords(restored, undefined, 4, (date) => {
            return applyFilters(filters, new Date(date[0]));
          })
        );
        setMotifs(
          calculateMotifs(restored, undefined, 4, (date) => {
            return applyFilters(filters, new Date(date[0]));
          })
        );
      });
    }
  }, [filters, matrixProfiles]);

  return (
    <div>
      <H3>{subject}</H3>
      <ObservationsChart datapoints={datapoints} />

      {matrixProfile && (
        <>
          <H3>Matrix Profile {matrixProfile.windowSize}</H3>
          <ObservationsChart datapoints={matrixProfileDatapoints} />

          <section className="mt-10">
            <H3>Discords</H3>
            <div className="mt-4 grid gap-10 grid-cols-2">
              {discords.map((discord, i) => {
                return (
                  <div key={discord}>
                    <H4>Discord {i + 1}</H4>
                    <ObservationLimitChart
                      collectionSubject={subject}
                      startDate={discord}
                      limit={matrixProfile.windowSize}
                    />
                  </div>
                );
              })}
            </div>
          </section>
          <section className="mt-10">
            <H3>Motifs</H3>
            <div className="mt-4 grid row-gap-10 grid-cols-1">
              {motifs.map(([motif, match], i) => (
                <div key={motif}>
                  <H4>Motif {i + 1}</H4>
                  <div className="grid col-gap-10 grid-cols-2">
                    <Motif
                      motif={motif}
                      match={match}
                      collectionSubject={subject}
                      windowSize={matrixProfile.windowSize}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default AnalyseCollection;
