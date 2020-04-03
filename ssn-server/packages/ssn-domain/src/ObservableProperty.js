import EventEmitter from 'events';
import N3 from 'n3';
import { RDF, SOSA, XSD } from './vocs.js';
const { quad, literal, namedNode } = N3.DataFactory;

class ObservableProperty extends EventEmitter {
  subject;
  quads = [];

  constructor(featureOfInterest, subject, { quads = [] } = {}) {
    super();

    this.subject = subject;
    this.featureOfInterest = featureOfInterest;

    this.quads = [quad(subject, RDF('type'), SOSA('ObservableProperty')), ...quads];
  }

  getQuads() {
    return this.quads;
  }

  addObservation(date, literalResult) {
    const observationQuads = [];

    const observationSubject = namedNode(`${this.subject.value}/member/${date.toISOString()}`);

    observationQuads.push(quad(observationSubject, RDF('type'), SOSA('Observation')));
    observationQuads.push(quad(observationSubject, SOSA('observedProperty'), this.subject));
    observationQuads.push(quad(observationSubject, SOSA('hasSimpleResult'), literalResult));
    observationQuads.push(
      quad(observationSubject, SOSA('hasFeatureOfInterest'), this.featureOfInterest.subject)
    );
    observationQuads.push(
      quad(observationSubject, SOSA('resultTime'), literal(date.toISOString(), XSD('dateTime')))
    );

    super.emit('observation', observationQuads);
  }

  emit() {
    throw new Error('Emit not supported. Use `addObservation`');
  }
}

export default ObservableProperty;
