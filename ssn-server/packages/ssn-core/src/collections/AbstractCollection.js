import N3 from 'n3';

const { namedNode } = N3.DataFactory;

class AbstractCollection extends N3.Store {
  getSubject(pageName) {
    const featureOfInterestSubject = this.observableProperty.featureOfInterest.subject.value;

    return namedNode(
      `${featureOfInterestSubject}/${this.observableProperty.name}Series${
        pageName ? `/` + pageName : ''
      }`
    );
  }
}

export default AbstractCollection;
