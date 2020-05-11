import N3 from 'n3';
import { RDF, DATEX, OWL, RDFS, SOSA } from './src/vocs.js';

const { quad, namedNode, literal } = N3.DataFactory;

const domains = {
  gent: {
    parkings: {
      P01: {
        quads: subject => [
          quad(subject, RDF('type'), DATEX('UrbanParkingSite')),
          quad(subject, OWL('sameAs'), namedNode('https://stad.gent/id/parking/P1')),
          quad(subject, DATEX('parkingName'), literal('Vrijdagmarkt')),
          quad(subject, DATEX('parkingNumberOfSpaces'), literal(648)),
          quad(subject, RDFS('label'), literal('Vrijdagmarkt'))
        ]
      },
      P02: {
        quads: subject => [
          quad(subject, RDF('type'), DATEX('UrbanParkingSite')),
          quad(subject, OWL('sameAs'), namedNode('https://stad.gent/id/parking/P2')),
          quad(subject, DATEX('parkingName'), literal('Reep')),
          quad(subject, DATEX('parkingNumberOfSpaces'), literal(486)),
          quad(subject, RDFS('label'), literal('Reep'))
        ]
      },
      P04: {
        quads: subject => [
          quad(subject, RDF('type'), DATEX('UrbanParkingSite')),
          quad(subject, OWL('sameAs'), namedNode('https://stad.gent/id/parking/P4')),
          quad(subject, DATEX('parkingName'), literal('Savaanstraat')),
          quad(subject, DATEX('parkingNumberOfSpaces'), literal(588)),
          quad(subject, RDFS('label'), literal('Savaanstraat'))
        ]
      },
      P07: {
        quads: subject => [
          quad(subject, RDF('type'), DATEX('UrbanParkingSite')),
          quad(subject, OWL('sameAs'), namedNode('https://stad.gent/id/parking/P7')),
          quad(subject, DATEX('parkingName'), literal('Sint-Michiels')),
          quad(subject, DATEX('parkingNumberOfSpaces'), literal(472)),
          quad(subject, RDFS('label'), literal('Sint-Michiels'))
        ]
      },
      P08: {
        quads: subject => [
          quad(subject, RDF('type'), DATEX('UrbanParkingSite')),
          quad(subject, OWL('sameAs'), namedNode('https://stad.gent/id/parking/P8')),
          quad(subject, DATEX('parkingName'), literal('Ramen')),
          quad(subject, DATEX('parkingNumberOfSpaces'), literal(280)),
          quad(subject, RDFS('label'), literal('Ramen'))
        ]
      },
      P10: {
        quads: subject => [
          quad(subject, RDF('type'), DATEX('UrbanParkingSite')),
          quad(subject, OWL('sameAs'), namedNode('https://stad.gent/id/parking/P10')),
          quad(subject, DATEX('parkingName'), literal('Sint-Pietersplein')),
          quad(subject, DATEX('parkingNumberOfSpaces'), literal(700)),
          quad(subject, RDFS('label'), literal('Sint-Pietersplein'))
        ]
      }
    }
  },
  leuven: {
    parkings: {
      Philipssite: {
        quads: subject => [
          quad(subject, RDF('type'), DATEX('UrbanParkingSite')),
          quad(subject, RDFS('label'), literal('Philipssite')),
          quad(subject, DATEX('parkingName'), literal('Philipssite')),
          quad(subject, DATEX('parkingNumberOfSpaces'), literal(1125))
        ]
      },
      Ladeuze: {
        quads: subject => [
          quad(subject, RDF('type'), DATEX('UrbanParkingSite')),
          quad(subject, RDFS('label'), literal('Ladeuze')),
          quad(subject, DATEX('parkingName'), literal('Ladeuze')),
          quad(subject, DATEX('parkingNumberOfSpaces'), literal(734))
        ]
      },
      'Heilig-Hart': {
        quads: subject => [
          quad(subject, RDF('type'), DATEX('UrbanParkingSite')),
          quad(subject, RDFS('label'), literal('Heilig-Hart')),
          quad(subject, DATEX('parkingName'), literal('Heilig-Hart')),
          quad(subject, DATEX('parkingNumberOfSpaces'), literal(285))
        ]
      }
    },
    telraam: {
      348180: {
        quads: subject => [
          quad(subject, RDF('type'), SOSA('Sensor')),
          quad(subject, RDFS('label'), literal('Mechelsesteenweg'))
        ]
      },
      348127: {
        quads: subject => [
          quad(subject, RDF('type'), SOSA('Sensor')),
          quad(subject, RDFS('label'), literal('Wijnpersstraat'))
        ]
      },
      554476: {
        quads: subject => [
          quad(subject, RDF('type'), SOSA('Sensor')),
          quad(subject, RDFS('label'), literal('Andreas Vesaliusstraat'))
        ]
      },
      347931: {
        quads: subject => [
          quad(subject, RDF('type'), SOSA('Sensor')),
          quad(subject, RDFS('label'), literal('Vital Decostersstraat'))
        ]
      }
    }
  }
};

export default domains;
