import { pipe, map, filter, groupBy } from 'lazy-collections';
import { fromRdf } from 'rdf-literal';

import toObject from './utils/toObject';
import { TREE, RDF } from '../utils/vocs';

import Query, {
  GREATER_THAN,
  LESS_THAN,
  GREATER_THAN_OR_EQUAL_TO,
  LESS_THAN_OR_EQUAL_TO,
} from './Query';

class TreeQuery extends Query {
  filterValues(type, value, isLeft) {
    return this.filters.some((filter) => {
      const filterValue = filter.value;

      switch (type) {
        case LESS_THAN.value:
        case GREATER_THAN.value:
          return isLeft ? filterValue < value : filterValue > value;

        case LESS_THAN_OR_EQUAL_TO.value:
        case GREATER_THAN_OR_EQUAL_TO.value:
          return isLeft ? filterValue <= value : filterValue >= value;

        default:
          throw new Error('Relation type not supported');
      }
    });
  }

  handleRelations(types, subjects) {
    const nodeTriples = this.getNodeTriples(types, subjects);

    const nodeRelations = pipe(
      nodeTriples || [],
      filter((triple) => triple.predicate.value === TREE('Relation').value),
      map((relation) => toObject(relation.object.value, subjects[relation.object.value])),
      groupBy((x) => x[TREE('node').value].value)
    )();

    Object.entries(nodeRelations).forEach(([node, conditions]) => {
      const shouldFollow = conditions.every((condition) => {
        const conditionType = condition[RDF('type').value].value;
        const conditionValue = fromRdf(condition[TREE('value').value]);

        const isLeft =
          conditionType === LESS_THAN.value || conditionType === LESS_THAN_OR_EQUAL_TO.value;

        const res = this.filterValues(conditionType, conditionValue, isLeft);

        return res;
      });

      if (shouldFollow) {
        this.execute(node);
      }
    });
  }
}

export default TreeQuery;
