import {
  FeatureOfInterestNotFoundException,
  ObservablePropertyNotFoundException
} from '../../exceptions/index.js';

import { IMMMUTABLE_CACHE, NO_CACHE } from '../constants.js';

const validateParams = (domain, params) => {
  const featureOfInterest = domain.getFeatureOfInterest(params.featureOfInterest);

  if (featureOfInterest === undefined) {
    throw new FeatureOfInterestNotFoundException();
  }

  const observableProperty = featureOfInterest.getObservableProperty(params.observableProperty);

  if (observableProperty === undefined) {
    throw new ObservablePropertyNotFoundException();
  }

  return observableProperty;
};

export const observablePropertyHandler = (domain, params) => {
  const observableProperty = validateParams(domain, params);
  const { immutable, body } = observableProperty.getPage(params.pageName);

  return {
    cache: immutable ? IMMMUTABLE_CACHE : NO_CACHE,
    body
  };
};
