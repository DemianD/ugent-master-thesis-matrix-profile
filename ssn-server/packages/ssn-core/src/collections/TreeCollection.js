import N3 from 'n3';
import { RDF, TREE } from '../utils/vocs.js';
import AbstractCollection from './AbstractCollection.js';

const { quad } = N3.DataFactory;

class TreeCollection extends AbstractCollection {
  constructor(observableProperty) {
    super();

    this.observableProperty = observableProperty;

    this.addQuad(quad(this.getSubject(), RDF('type'), TREE('collection')));
  }

  addQuad(quad) {
    super.addQuad(quad);
    this.observableProperty.featureOfInterest.addQuad(quad);
  }
}

export default TreeCollection;
