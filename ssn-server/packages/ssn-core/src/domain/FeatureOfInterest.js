import N3 from 'n3';
import ObservableProperty from './ObservableProperty.js';
import { SOSA, RDF } from '../utils/vocs.js';

const { quad, namedNode } = N3.DataFactory;

class FeatureOfInterest extends N3.Store {
  subject;
  observableProperties = {};

  constructor(subject, { quads = () => [] } = {}) {
    super();

    this.subject = subject;

    this.addQuads([quad(subject, RDF('type'), SOSA('FeatureOfInterest')), ...quads(subject)]);
  }

  addObservableProperty(namedNode) {
    this.observableProperties[namedNode.value] = new ObservableProperty(this, namedNode);

    return this.observableProperties[namedNode.value];
  }

  getObservableProperty(observablePropertyName) {
    return this.observableProperties[observablePropertyName];
  }
}

export default FeatureOfInterest;
