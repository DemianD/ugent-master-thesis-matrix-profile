import { TREE, HYDRA, SOSA, MP } from '../utils/vocs';
import fetcher from './utils/fetcher';
import mapTriples from './utils/mapTriples';
import { fromRdf } from 'rdf-literal';
import applyFilters from './utils/applyFilters';
import toObject from './utils/toObject';

export const GREATER_THAN_OR_EQUAL_TO = TREE('GreaterOrEqualThanRelation');
export const GREATER_THAN = TREE('GreaterThanRelation');
export const LESS_THAN = TREE('LessThanRelation');
export const LESS_THAN_OR_EQUAL_TO = TREE('LessOrEqualThanRelation');
export const EQUAL_THAN_RELATION = TREE('EqualThanRelation');

class Query {
  cancelled = false;
  withMetadata = false;

  constructor(filters, withMetadata, onData) {
    this.filters = filters;
    this.onData = onData;
    this.withMetadata = withMetadata;
  }

  cancel() {
    this.cancelled = true;
  }

  getNodeTriples(types, subjects) {
    const nodes = types[TREE('Node').value];
    return nodes && subjects[nodes[0]];
  }

  getHydraView(types, subjects) {
    const hydraViews = types[HYDRA('PartialCollectionView').value];
    return hydraViews && toObject(hydraViews[0], subjects[hydraViews[0]]);
  }

  execute(datasource) {
    fetcher
      .get(datasource)
      .then((response) => {
        if (this.cancelled) {
          return;
        }

        const { types, subjects } = mapTriples(response.triples);

        this.handleRelations(types, subjects);

        // TODO: make this more generic
        const snippets = (types[MP('Snippet').value] || []).map((snippetSubject) =>
          toObject(snippetSubject, subjects[snippetSubject], { datasource })
        );

        this.onData('snippets', snippets);

        // TODO: make this more generic
        const observations = (types[SOSA('Observation').value] || [])
          .map((observationSubject) =>
            toObject(
              observationSubject,
              subjects[observationSubject],
              this.withMetadata && {
                datasource,
                node: this.getNodeTriples(types, subjects),
                hydraView: this.getHydraView(types, subjects),
              }
            )
          )
          .filter((observation) => {
            const resultTime = fromRdf(observation[SOSA('resultTime').value]);

            return applyFilters(this.filters, resultTime);
          });

        this.onData('observations', observations);
      })
      .catch(console.error);
  }
}

export default Query;
