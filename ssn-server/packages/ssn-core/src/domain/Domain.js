import N3 from 'n3';
import FeatureOfInterest from './FeatureOfInterest.js';

const { namedNode } = N3.DataFactory;

class Domain {
  featuresOfInterest = {};

  constructor(baseIRI) {
    this.baseIRI = baseIRI;
  }

  addFeatureOfInterest(name, options) {
    this.featuresOfInterest[name] = new FeatureOfInterest(
      namedNode(`${this.baseIRI}/${name}`),
      options
    );

    return this.featuresOfInterest[name];
  }

  getFeatureOfInterest(featureOfInterestName) {
    return this.featuresOfInterest[featureOfInterestName];
  }
}

export default Domain;
