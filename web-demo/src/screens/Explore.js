import React from 'react';
import { Link } from '@reach/router';

import useComunica from '../hooks/useComunica';
import { H1, H3 } from '../components/Heading';
import ComunicaLink from '../components/ComunicaLink';

import {
  getParkingsQuery,
  getTelraamsQuery,
  getFietstellingQuery,
  getLuftdatenQuery,
} from '../queries';

const Explore = () => {
  const [parkingsGhent] = useComunica(
    'https://mp-server.dem.be/parkings/gent/catalog',
    getParkingsQuery,
    true
  );

  const [parkingsLeuven] = useComunica(
    'https://mp-server.dem.be/parkings/leuven/catalog',
    getParkingsQuery,
    true
  );

  const [telraams] = useComunica(
    'https://mp-server.dem.be/telraam/catalog',
    getTelraamsQuery,
    true
  );

  const [luftdatens] = useComunica(
    'https://mp-server.dem.be/luftdaten/catalog',
    getLuftdatenQuery,
    true
  );

  const [fietstellings] = useComunica(
    'https://mp-server.dem.be/fietstelling/catalog',
    getFietstellingQuery,
    true
  );

  const parkings = [
    {
      city: 'Leuven',
      datasource: 'https://mp-server.dem.be/parkings/leuven/catalog',
      data: parkingsLeuven,
    },
    {
      city: 'Ghent',
      datasource: 'https://mp-server.dem.be/parkings/gent/catalog',
      data: parkingsGhent,
    },
  ];

  return (
    <>
      <H1 className="mt-8">Explore</H1>
      {parkings.map(({ city, datasource, data }) => (
        <section className="w-8/12 mb-6" key={city}>
          <H3>
            Parkings {city} <ComunicaLink datasource={datasource} query={getParkingsQuery} />
          </H3>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {data.map((parking) => (
              <Link
                key={parking.get('?parkingName').value}
                to={`/analyse?query=${encodeURIComponent(parking.get('?s').value)}`}
              >
                <div
                  className="flex flex-col cursor-pointer p-3"
                  style={{ backgroundColor: '#ffecec' }}
                >
                  <span className="text-4xl font-black tracking-tighter leading-tight text-blue-1000">
                    {parking.get('?parkingNumberOfSpaces').value}
                  </span>
                  <span className="text-xs">{parking.get('?parkingName').value}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <section className="w-8/12 mb-6">
        <H3>
          Fietstelling AWV{' '}
          <ComunicaLink
            datasource={'https://mp-server.dem.be/fietstelling/catalog'}
            query={getFietstellingQuery}
          />
        </H3>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {fietstellings.map((fietstelling) => (
            <Link
              key={fietstelling.get('?label').value}
              to={`/analyse?query=${encodeURIComponent(fietstelling.get('?s').value)}`}
            >
              <div
                className="flex flex-col cursor-pointer p-3"
                style={{ backgroundColor: '#ffecec' }}
              >
                <span className="text-xs truncate">{fietstelling.get('?label').value}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="w-8/12 mb-6">
        <H3>
          Telraam{' '}
          <ComunicaLink
            datasource={'https://mp-server.dem.be/telraam/catalog'}
            query={getTelraamsQuery}
          />
        </H3>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {telraams.map((telraam) => (
            <Link
              key={telraam.get('?label').value}
              to={`/analyse?query=${encodeURIComponent(telraam.get('?s').value)}`}
            >
              <div
                className="flex flex-col cursor-pointer p-3"
                style={{ backgroundColor: '#ffecec' }}
              >
                <span className="text-xs truncate">{telraam.get('?label').value}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="w-8/12 mb-6">
        <H3>
          Luftdaten{' '}
          <ComunicaLink
            datasource={'https://mp-server.dem.be/luftdaten/catalog'}
            query={getLuftdatenQuery}
          />
        </H3>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {luftdatens.map((luftdaten) => (
            <Link
              key={luftdaten.get('?label').value}
              to={`/analyse?query=${encodeURIComponent(luftdaten.get('?s').value)}`}
            >
              <div
                className="flex flex-col cursor-pointer p-3"
                style={{ backgroundColor: '#ffecec' }}
              >
                <span className="text-xs truncate">{luftdaten.get('?label').value}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
};

export default Explore;
