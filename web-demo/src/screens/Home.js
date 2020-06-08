import React from 'react';
import { H1, H3 } from '../components/Heading';
import Content from '../components/Content';
import ExternalLink from '../components/ExternalLink';

const Home = () => {
  return (
    <>
      <div className="mt-16 text-center max-w-screen-md">
        <H1 className="sm:text-5xl md:text-5xl">
          Publishing and analysing time series on the Semantic Web with Matrix Profile techniques
        </H1>
      </div>
      <Content className="mt-16 flex flex-col md:flex-row">
        <section className="w-full mb-8 md:w-2/3">
          <H3>Abstract</H3>

          <p className="mb-2">
            Analyzing{' '}
            <ExternalLink href="https://en.wikipedia.org/wiki/Time_series">
              time series
            </ExternalLink>{' '}
            published on the Web can reveal interesting characteristics. Real-time datasets
            published on the Web often contain only the most recent values, which makes it hard to
            analyze the history. There is a need for an efficient way to publish and analyze time
            series. This master thesis researches how a time series should be published on the Web
            to allow analyzes, and how a matrix profile can help.
          </p>
          <p className="mb-2">
            Based on a proof of concept, different time series are published on the{' '}
            <ExternalLink href="https://www.w3.org/standards/semanticweb/">
              Semantic Web
            </ExternalLink>{' '}
            using <ExternalLink href="https://www.w3.org/RDF/">RDF</ExternalLink> and the{' '}
            <ExternalLink href="https://www.w3.org/TR/vocab-ssn/">
              Semantic Sensor Networking (SSN)
            </ExternalLink>{' '}
            ontology. Each time series is divided into fragments where different tree structures are
            examined to link the fragments. This master thesis proposes to use a B+ tree where the
            leaves contain the observations, and where the internal nodes are used to locate the
            observations and to publish summaries. B+ trees are self-balancing trees and require
            only an update on the most right path when a new fragment or observation is added. As a
            result, only a small number of fragments need to be updated. All other fragments are
            immutable and infinitely cacheable.
          </p>
          <p className="mb-3">
            A{' '}
            <ExternalLink href="https://www.cs.ucr.edu/~eamonn/MatrixProfile.html">
              matrix profile
            </ExternalLink>{' '}
            is published for each time series, enabling patterns and anomalies to be found quickly
            and efficiently. However, it is not possible to compare or merge multiple time series
            with a published matrix profile. Future research should investigate how this can be
            done, and whether it is possible to calculate the matrix profile on the client.
          </p>
          <p className="mb-2 text-xs">
            <span className="italic">keywords </span>
            <span>&mdash; </span>
            <span>
              semantic web, linked data, time series, time series analysis, matrix profile
            </span>
          </p>
        </section>
      </Content>
    </>
  );
};

export default Home;
