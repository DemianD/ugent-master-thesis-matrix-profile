import React from 'react';
import { H1, H3 } from '../components/Heading';
import Content from '../components/Content';

const Home = () => {
  return (
    <>
      <div className="mt-16 text-center max-w-screen-md">
        <H1 className="sm:text-5xl md:text-5xl">
          Publishing and analysing time series on the Semantic Web with Matrix Profile techniques
        </H1>
      </div>
      <Content className="mt-16 flex flex-col md:flex-row">
        <section className="w-full mb-8 md:w-1/2">
          <H3>Abstract</H3>
          <p className="mb-2">
            This is part of a master thesis where time series are published on the semantic web
            using linked data.
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        </section>
      </Content>
    </>
  );
};

export default Home;
