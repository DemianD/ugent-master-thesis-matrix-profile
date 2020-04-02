import EventEmitter from 'events';
import N3 from 'n3';
import { RDF, SOSA } from './vocs.js';
const { quad } = N3.DataFactory;

class ObservableProperty extends EventEmitter {
  subject;
  quads = [];

  constructor(subject, { quads = [] } = {}) {
    super();

    this.subject = subject;

    this.quads = [quad(subject, RDF('type'), SOSA('ObservableProperty')), ...quads];
  }

  getQuads() {
    return this.quads;
  }
}

export default ObservableProperty;
