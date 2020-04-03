import N3 from 'n3';
import ObservableProperty from './ObservableProperty.js';
import { SOSA, RDF } from './vocs.js';

const { quad, namedNode } = N3.DataFactory;

class FeatureOfInterest {
  subject;
  quads = [];
  observableProperties = {};

  constructor(subject, { quads = () => [] } = {}) {
    this.subject = subject;

    this.quads = [quad(subject, RDF('type'), SOSA('FeatureOfInterest')), ...quads(subject)];
  }

  addObservableProperty(name, options) {
    this.observableProperties[name] = new ObservableProperty(
      this,
      namedNode(`${this.subject.value}/${name}`),
      options
    );

    return this.observableProperties[name];
  }

  getObservableProperty(observablePropertyName) {
    return this.observableProperties[observablePropertyName];
  }

  getQuads() {
    return this.quads;
  }
}

export default FeatureOfInterest;
