import { SourceReader } from '@ssn/core';
import { SOSA, RDF } from '../vocs.js';

class ParkingGentSourceReader extends SourceReader {
  constructor(domain, sources, refreshInterval, mapping) {
    super(sources, refreshInterval, mapping);

    this.domain = domain;
    this.cron.start();
    this.i = 0;
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

      const [key, name] = rawFeatureOfInterest.value.split('/').pop().split('%20');

      const featureOfInterest = this.domain.getFeatureOfInterest(key);

      if (!featureOfInterest) {
        console.error('No featureOfInterest found for ', rawFeatureOfInterest.value);
        return;
      }

      const observableProperty = featureOfInterest.getObservableProperty(rawObservedProperty.value);

      if (!observableProperty) {
        console.error('No observableProperty found for ', rawObservedProperty.value);
        return;
      }

      const literalResult = store.getObjects(subject, SOSA('hasSimpleResult'))[0];

      const date = Date.UTC(2020, 4, 1, 16, 1, 0, 0);

      observableProperty.addObservation(new Date(date + 1000 * 60 * 1 * this.i++), literalResult);
    });
  }
}

export default ParkingGentSourceReader;
