import { FeatureOfInterestNotFoundException } from '../../exceptions/index.js';
import { NO_CACHE } from '../constants.js';

export const featureOfInterestHandler = (domain, params) => {
  const featureOfInterest = domain.getFeatureOfInterest(params.featureOfInterest);

  if (featureOfInterest === undefined) {
    throw new FeatureOfInterestNotFoundException();
  }

  const body = [
    ...featureOfInterest.getQuads(),
    ...Object.values(featureOfInterest.observableProperties)
      .map(observableProperty => {
        return observableProperty.getQuads();
      })
      .flat()
  ];

  return {
    cache: NO_CACHE,
    body
  };
};
