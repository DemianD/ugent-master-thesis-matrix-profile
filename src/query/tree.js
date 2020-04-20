import * as rdf from 'rdflib';
import { fromRdf } from 'rdf-literal';
import { getRelations } from '../queries';
import { TREE } from '../utils/vocs';

export const GREATER_THAN_OR_EQUAL_TO = TREE('GreaterOrEqualThanRelation');
export const GREATER_THAN = TREE('GreaterThanRelation');
export const LESS_THAN = TREE('LessThanRelation');
export const LESS_THAN_OR_EQUAL_TO = TREE('LessOrEqualThanRelation');

class TreeQuery {
  cancelled = false;

  constructor(query, filters, onData) {
    this.query = query;
    this.filters = filters;
    this.onData = onData;
  }

  createStore(datasource) {
    return fetch(datasource)
      .then((response) => response.text())

      .then((content) => {
        const store = rdf.graph();

        rdf.parse(content, store, datasource, 'text/turtle');

        return store;
      });
  }

  handleRelations(relations) {
    relations
      .filter((relation) => {
        const relationType = relation['?relationType'].value;
        const relationValue = fromRdf(relation['?value']);

        const isLeft =
          relationType === LESS_THAN.value || relationType === LESS_THAN_OR_EQUAL_TO.value;

        return this.filters.some((filter) => {
          const filterValue = filter.value;

          switch (filter['relationType'].value) {
            case LESS_THAN.value:
            case GREATER_THAN.value:
              return isLeft ? filterValue < relationValue : filterValue > relationValue;

            case LESS_THAN_OR_EQUAL_TO.value:
            case GREATER_THAN_OR_EQUAL_TO.value:
              return isLeft ? filterValue <= relationValue : filterValue >= relationValue;

            default:
              throw new Error('Relation type not supported');
          }
        });
      })
      .forEach((relation) => {
        this.execute(relation['?node'].value);
      });
  }

  execute(datasource) {
    this.createStore(datasource).then((store) => {
      if (this.cancelled) {
        return;
      }

      const mainQuery = rdf.SPARQLToQuery(this.query, false, store);
      const treeQuery = rdf.SPARQLToQuery(getRelations, false, store);

      const relations = store.querySync(treeQuery);
      relations.length > 0 && this.handleRelations(relations);

      const results = store.querySync(mainQuery);
      this.onData(results);
    });
  }

  cancel() {
    this.cancelled = true;
  }
}

export default TreeQuery;
