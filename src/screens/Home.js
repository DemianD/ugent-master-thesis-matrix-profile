import React from 'react';
import { H1, H3 } from '../components/Heading';

const Home = () => {
  return (
    <>
      <div className="mt-16 text-center">
        <H1 className="sm:text-5xl md:text-6xl">
          time-series published <br />
          on the linked, semantic web
        </H1>
      </div>
      <div className="w-8/12 mt-16 flex flex-col md:flex-row">
        <section className="w-full mb-8 md:w-1/2">
          <H3>Abstract</H3>
          <p className="mb-2">
            This is part of a master thesis where time series are published on
            the semantic web using linked data.
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </p>
        </section>
      </div>
    </>
  );
};

export default Home;
