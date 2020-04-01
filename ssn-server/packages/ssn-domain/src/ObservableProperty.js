import EventEmitter from 'events';
import N3 from 'n3';
const { quad, namedNode } = N3.DataFactory;

class ObservableProperty extends EventEmitter {
  subject;
  quads = [];

  constructor(subject, { quads = [] } = {}) {
    super();

    this.subject = subject;

    this.quads = [
      quad(subject, namedNode('rdf:type'), namedNode('sosa:ObservableProperty')),
      ...quads
    ];
  }

  getQuads() {
    return this.quads;
  }
}

export default ObservableProperty;
