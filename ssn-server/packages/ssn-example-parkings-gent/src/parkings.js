import N3 from 'n3';
import { RDF, SOSA, DATEX, OWL } from './utils/vocs.js';

const { namedNode, literal } = N3.DataFactory;

const parkings = {
  P01: {
    quads: subject => [
      [subject, RDF('type'), SOSA('observation')],
      [subject, RDF('type'), DATEX('UrbanParkingSite')],
      [subject, OWL('sameAs'), namedNode('https://stad.gent/id/parking/P1')],
      [subject, DATEX('parkingName'), literal('Vrijdagmarkt')],
      [subject, DATEX('parkingNumberOfSpaces'), literal(648)]
    ]
  },
  P02: {
    quads: subject => [
      [subject, RDF('type'), SOSA('observation')],
      [subject, RDF('type'), DATEX('UrbanParkingSite')],
      [subject, OWL('sameAs'), namedNode('https://stad.gent/id/parking/P2')],
      [subject, DATEX('parkingName'), literal('Reep')],
      [subject, DATEX('parkingNumberOfSpaces'), literal(486)]
    ]
  },
  P04: {
    quads: subject => [
      [subject, RDF('type'), SOSA('observation')],
      [subject, RDF('type'), DATEX('UrbanParkingSite')],
      [subject, OWL('sameAs'), namedNode('https://stad.gent/id/parking/P4')],
      [subject, DATEX('parkingName'), literal('Savaanstraat')],
      [subject, DATEX('parkingNumberOfSpaces'), literal(588)]
    ]
  },
  P07: {
    quads: subject => [
      [subject, RDF('type'), SOSA('observation')],
      [subject, RDF('type'), DATEX('UrbanParkingSite')],
      [subject, OWL('sameAs'), namedNode('https://stad.gent/id/parking/P7')],
      [subject, DATEX('parkingName'), literal('Sint-Michiels')],
      [subject, DATEX('parkingNumberOfSpaces'), literal(472)]
    ]
  },
  P08: {
    quads: subject => [
      [subject, RDF('type'), SOSA('observation')],
      [subject, RDF('type'), DATEX('UrbanParkingSite')],
      [subject, OWL('sameAs'), namedNode('https://stad.gent/id/parking/P8')],
      [subject, DATEX('parkingName'), literal('Ramen')],
      [subject, DATEX('parkingNumberOfSpaces'), literal(280)]
    ]
  },
  P10: {
    quads: subject => [
      [subject, RDF('type'), SOSA('observation')],
      [subject, RDF('type'), DATEX('UrbanParkingSite')],
      [subject, OWL('sameAs'), namedNode('https://stad.gent/id/parking/P10')],
      [subject, DATEX('parkingName'), literal('Sint-Pietersplein')],
      [subject, DATEX('parkingNumberOfSpaces'), literal(700)]
    ]
  }
};

export default parkings;
