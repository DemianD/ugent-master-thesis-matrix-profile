import test from 'ava';
import Domain from '../index.js';

test('Empty Domain', t => {
  const domain = new Domain('https://www.example.com');

  t.snapshot(domain.catalog());
});

test('it should contain two features of interest', t => {
  const domain = new Domain('https://www.example.com');

  domain.addFeatureOfInterest('Feature1');
  domain.addFeatureOfInterest('Feature2');

  t.snapshot(domain.catalog());
});

test('it should contain the observed properties', t => {
  const domain = new Domain('https://www.example.com');

  const featureOfInterest = domain.addFeatureOfInterest('Feature1');

  featureOfInterest.addObservableProperty('Property1');
  featureOfInterest.addObservableProperty('Property2');

  t.snapshot(domain.catalog());
});
