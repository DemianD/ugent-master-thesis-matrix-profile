import test from 'ava';

import { Domain, Interfaces } from '../../index.js';
const CatalogInterface = Interfaces.CatalogInterface;

const dummyCommunicationManager = {
  addEndpoints: () => {}
};

test('Empty Domain', t => {
  const domain = new Domain('https://www.example.com');
  const catalogInterface = new CatalogInterface(dummyCommunicationManager, domain);

  t.snapshot(catalogInterface.catalogHandler().body);
});

test('it should contain two features of interest', t => {
  const domain = new Domain('https://www.example.com');
  const catalogInterface = new CatalogInterface(dummyCommunicationManager, domain);

  domain.addFeatureOfInterest('Feature1');
  domain.addFeatureOfInterest('Feature2');

  t.snapshot(catalogInterface.catalogHandler().body);
});

test('it should contain the observed properties', t => {
  const domain = new Domain('https://www.example.com');
  const catalogInterface = new CatalogInterface(dummyCommunicationManager, domain);

  const featureOfInterest = domain.addFeatureOfInterest('Feature1');

  featureOfInterest.addObservableProperty('Property1');
  featureOfInterest.addObservableProperty('Property2');

  t.snapshot(catalogInterface.catalogHandler().body);
});
