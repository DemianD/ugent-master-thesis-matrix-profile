import Adapters from 'ssn-adapters';

import N3 from 'n3';
import { SOSA, RDF, XSD } from './utils/vocs.js';
import getLocalPart from './utils/getLocalPart.js';

const { quad: newQuad, namedNode, literal } = N3.DataFactory;

class ParkingGentSourceReader extends Adapters.SourceReader {
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

      if (featureOfInterest) {
        const observableProperty = featureOfInterest.getObservableProperty(
          getLocalPart(rawObservedProperty.value)
        );

        if (observableProperty) {
          const date = new Date();
          const uniqueSubject = namedNode(`${observableProperty.subject}/${date.toISOString()}`);

          // Create new quads with correct unique subject and aligned feature of interest and observableProperty
          const observationQuads = store.getQuads(subject).map(quad => {
            let object = quad.object;

            if (quad.predicate.value === SOSA('hasFeatureOfInterest').value) {
              object = namedNode(featureOfInterest.subject);
            }

            if (quad.predicate.value === SOSA('observedProperty').value) {
              object = namedNode(observableProperty.subject);
            }

            return newQuad(uniqueSubject, quad.predicate, object);
          });

          // Add current time quad
          observationQuads.push(
            newQuad(uniqueSubject, SOSA('resultTime'), literal(date.toISOString(), XSD('dateTime')))
          );

          observableProperty.emit('observation', observationQuads);
        } else {
          console.error('No observableProperty found for ', rawObservedProperty.value);
        }
      } else {
        console.error('No featureOfInterest found for ', rawFeatureOfInterest.value);
      }
    });
  }
}

export default ParkingGentSourceReader;
