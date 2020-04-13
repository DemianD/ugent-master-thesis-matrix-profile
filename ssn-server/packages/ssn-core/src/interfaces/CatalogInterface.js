import { FeatureOfInterestNotFoundException } from '../exceptions/index.js';

class CatalogInterface {
  constructor(communicationManager, domain) {
    this.communicationManager = communicationManager;
    this.domain = domain;

    this.registerEndpoints();
  }

  catalogHandler() {
    const quads = Object.values(this.domain.featuresOfInterest)
      .map(featureOfInterest => {
        return featureOfInterest.getQuads();
      })
      .flat(Infinity);

    return {
      body: quads,
      immutable: false
    };
  }

  featureOfInterestCatalogHandler(params) {
    const featureOfInterest = this.domain.getFeatureOfInterest(params.feature_of_interest);

    if (!featureOfInterest) {
      throw new FeatureOfInterestNotFoundException();
    }

    return {
      body: featureOfInterest.getQuads(),
      immutable: false
    };
  }

  registerEndpoints() {
    this.communicationManager.addEndpoints({
      ['/catalog']: params => this.catalogHandler(params),
      ['/:feature_of_interest']: params => this.featureOfInterestCatalogHandler(params)
    });
  }
}

export default CatalogInterface;
