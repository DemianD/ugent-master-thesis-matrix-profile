import React from 'react';
import { H1, H3 } from '../components/Heading';
import useComunica from '../hooks/useComunica';
import { getParkingsQuery } from '../queries';
import ComunicaLink from '../components/ComunicaLink';
import { Link } from '@reach/router';

const Explore = () => {
  const [parkings] = useComunica('https://mp-server.dem.be/catalog', getParkingsQuery, true);

  return (
    <>
      <H1 className="mt-8">Explore</H1>
      <section className="w-8/12 mb-6">
        <H3>
          Parkings Ghent{' '}
          <ComunicaLink datasource="https://mp-server.dem.be/catalog" query={getParkingsQuery} />
        </H3>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {parkings.map((parking) => (
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
    </>
  );
};

export default Explore;
