import N3 from 'n3';
import FeatureOfInterest from './FeatureOfInterest.js';

const { namedNode } = N3.DataFactory;

class Domain {
  featuresOfInterest = {};

  constructor(baseUri) {
    this.baseUri = baseUri;
  }

  addFeatureOfInterest(name, options) {
    this.featuresOfInterest[name] = new FeatureOfInterest(
      namedNode(`${this.baseUri}/${name}`),
      options
    );

    return this.featuresOfInterest[name];
  }

  getFeatureOfInterest(featureOfInterestName) {
    return this.featuresOfInterest[featureOfInterestName];
  }

  prefixes() {
    return {
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      datex: 'http://vocab.datex.org/terms#',
      sosa: 'http://www.w3.org/ns/sosa/',
      xsd: 'http://www.w3.org/2001/XMLSchema#'
    };
  }

  catalog() {
    return [
      ...Object.values(this.featuresOfInterest)
        .map(featureOfInterest => {
          return [
            featureOfInterest.getQuads(),
            ...Object.values(featureOfInterest.observableProperties).map(observableProperty => {
              return observableProperty.getQuads();
            })
          ];
        })
        .flat(Infinity)
    ];
  }
}

export default Domain;
