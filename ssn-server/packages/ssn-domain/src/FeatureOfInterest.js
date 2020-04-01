import N3 from 'n3';
import ObservableProperty from './ObservableProperty.js';

const { quad, namedNode } = N3.DataFactory;

class FeatureOfInterest {
  subject;
  quads = [];
  observableProperties = {};

  constructor(subject, { quads = () => [] } = {}) {
    this.subject = subject;

    this.quads = [
      quad(subject, namedNode('rdf:type'), namedNode('sosa:FeatureOfInterest')),
      ...quads(subject)
    ];
  }

  addObservableProperty(name, options) {
    this.observableProperties[name] = new ObservableProperty(
      namedNode(`${this.subject.value}/${name}`),
      options
    );
    return this.observableProperties[name];
  }

  getObservableProperty(observablePropertyName) {
    return this.observableProperties[observablePropertyName];
  }

  getQuads() {
    return [
      ...this.quads,
      ...Object.values(this.observableProperties)
        .map(observableProperty => observableProperty.getQuads())
        .flat()
    ];
  }
}

export default FeatureOfInterest;
