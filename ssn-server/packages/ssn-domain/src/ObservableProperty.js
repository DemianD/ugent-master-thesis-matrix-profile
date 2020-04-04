import EventEmitter from 'events';
import N3 from 'n3';
import { RDF, SOSA, XSD } from './vocs.js';
const { quad, literal, namedNode } = N3.DataFactory;

class ObservableProperty extends EventEmitter {
  subject;
  quads = [];
  storageInterface;

  constructor(featureOfInterest, subject, { quads = [] } = {}) {
    super();

    this.subject = subject;
    this.featureOfInterest = featureOfInterest;

    this.quads = [quad(subject, RDF('type'), SOSA('ObservableProperty')), ...quads];
  }

  getQuads() {
    return this.quads;
  }

  setStorageInterface(storageInterface) {
    this.storageInterface = storageInterface;
  }

  addObservation(date, literalResult) {
    const observationStore = new N3.Store();
    const observationSubject = namedNode(`${this.subject.value}/member/${date.toISOString()}`);

    observationStore.addQuad(observationSubject, RDF('type'), SOSA('Observation'));
    observationStore.addQuad(observationSubject, SOSA('observedProperty'), this.subject);
    observationStore.addQuad(observationSubject, SOSA('hasSimpleResult'), literalResult);

    observationStore.addQuad(
      observationSubject,
      SOSA('hasFeatureOfInterest'),
      this.featureOfInterest.subject
    );

    observationStore.addQuad(
      observationSubject,
      SOSA('resultTime'),
      literal(date.toISOString(), XSD('dateTime'))
    );

    this.storageInterface && this.storageInterface.addObservation(observationStore);
    super.emit('observation', observationStore);
  }

  getPage(pageName) {
    return this.storageInterface.getPage(pageName);
  }

  emit() {
    throw new Error('Emit not supported. Use `addObservation`');
  }
}

export default ObservableProperty;
