import N3 from 'n3';
import { RDF, SOSA, DATEX, OWL } from './vocs.js';

const { quad, namedNode, literal } = N3.DataFactory;

const parkings = {
  P01: {
    quads: subject => [
      quad(subject, RDF('type'), DATEX('UrbanParkingSite')),
      quad(subject, OWL('sameAs'), namedNode('https://stad.gent/id/parking/P1')),
      quad(subject, DATEX('parkingName'), literal('Vrijdagmarkt')),
      quad(subject, DATEX('parkingNumberOfSpaces'), literal(648))
    ]
  },
  P02: {
    quads: subject => [
      quad(subject, RDF('type'), DATEX('UrbanParkingSite')),
      quad(subject, OWL('sameAs'), namedNode('https://stad.gent/id/parking/P2')),
      quad(subject, DATEX('parkingName'), literal('Reep')),
      quad(subject, DATEX('parkingNumberOfSpaces'), literal(486))
    ]
  },
  P04: {
    quads: subject => [
      quad(subject, RDF('type'), DATEX('UrbanParkingSite')),
      quad(subject, OWL('sameAs'), namedNode('https://stad.gent/id/parking/P4')),
      quad(subject, DATEX('parkingName'), literal('Savaanstraat')),
      quad(subject, DATEX('parkingNumberOfSpaces'), literal(588))
    ]
  },
  P07: {
    quads: subject => [
      quad(subject, RDF('type'), DATEX('UrbanParkingSite')),
      quad(subject, OWL('sameAs'), namedNode('https://stad.gent/id/parking/P7')),
      quad(subject, DATEX('parkingName'), literal('Sint-Michiels')),
      quad(subject, DATEX('parkingNumberOfSpaces'), literal(472))
    ]
  },
  P08: {
    quads: subject => [
      quad(subject, RDF('type'), DATEX('UrbanParkingSite')),
      quad(subject, OWL('sameAs'), namedNode('https://stad.gent/id/parking/P8')),
      quad(subject, DATEX('parkingName'), literal('Ramen')),
      quad(subject, DATEX('parkingNumberOfSpaces'), literal(280))
    ]
  },
  P10: {
    quads: subject => [
      quad(subject, RDF('type'), DATEX('UrbanParkingSite')),
      quad(subject, OWL('sameAs'), namedNode('https://stad.gent/id/parking/P10')),
      quad(subject, DATEX('parkingName'), literal('Sint-Pietersplein')),
      quad(subject, DATEX('parkingNumberOfSpaces'), literal(700))
    ]
  }
};

export default parkings;
