import { Readers } from '@ssn/adapters';
import { SOSA, RDF, XSD } from './vocs.js';

class ParkingGentSourceReader extends Readers.SourceReader {
  constructor(domain, sources, refreshInterval, mapping) {
    super(sources, refreshInterval, mapping);

    this.domain = domain;
    this.cron.start();
  }

  async run() {
    const data = await this.fetchSourcesAsync();
    const store = await this.mapData(data);

    // Subjects of observations
    const subjectsOfObservations = store.getSubjects(RDF('type'), SOSA('Observation'));

    // Date of the observations
    const date = new Date();

    // For each observation, we should change the subject with the correct URI
    subjectsOfObservations.forEach(subject => {
      const rawFeatureOfInterest = store.getObjects(subject, SOSA('hasFeatureOfInterest'))[0];
      const rawObservedProperty = store.getObjects(subject, SOSA('observedProperty'))[0];

      // rawFeatureOfInterest contains an IRI where the last segment contains PXX%20Name
      const [key, name] = rawFeatureOfInterest.value
        .split('/')
        .pop()
        .split('%20');

      const featureOfInterest = this.domain.getFeatureOfInterest(key);

      if (!featureOfInterest) {
        console.error('No featureOfInterest found for ', rawFeatureOfInterest.value);
        return;
      }

      const observableProperty = featureOfInterest.getObservableProperty(
        this.getLocalPart(rawObservedProperty.value)
      );

      if (!observableProperty) {
        console.error('No observableProperty found for ', rawObservedProperty.value);
        return;
      }

      const literalResult = store.getObjects(subject, SOSA('hasSimpleResult'))[0];
      observableProperty.addObservation(date, literalResult);
    });
  }

  getLocalPart(IRI) {
    const lastSegment = IRI.substring(IRI.lastIndexOf('/') + 1);
    const hashIndex = lastSegment.lastIndexOf('#');

    if (hashIndex == -1) {
      return lastSegment;
    }

    return lastSegment.substring(hashIndex + 1);
  }
}

export default ParkingGentSourceReader;
