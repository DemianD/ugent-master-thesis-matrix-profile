import {
  FeatureOfInterestNotFoundException,
  ObservablePropertyNotFoundException
} from '../../exceptions/index.js';

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

  return {
    cache: 'no-cache, no-store, must-revalidate',
    body: observableProperty.getPage(params.pageName)
  };
};
