import ldfetch from 'ldfetch';
import { pipe, map, filter, groupBy } from 'lazy-collections';

import { fromRdf } from 'rdf-literal';
import { TREE, RDF, SOSA } from '../utils/vocs';
import applyFilter from '../utils/queryFilter';

export const GREATER_THAN_OR_EQUAL_TO = TREE('GreaterOrEqualThanRelation');
export const GREATER_THAN = TREE('GreaterThanRelation');
export const LESS_THAN = TREE('LessThanRelation');
export const LESS_THAN_OR_EQUAL_TO = TREE('LessOrEqualThanRelation');
export const EQUAL_THAN_RELATION = TREE('EqualThanRelation');

const toObject = (subjectTriples, metadata) => {
  const initialObject = metadata ? { __meta: metadata } : {};

  return subjectTriples.reduce((acc, triple) => {
    if (acc[triple.predicate.value]) {
      acc[triple.predicate.value] = [...acc[triple.predicate.value], triple.object];
    } else {
      acc[triple.predicate.value] = triple.object;
    }

    return acc;
  }, initialObject);
};

const fetcher = new ldfetch();

fetcher.on('cache-miss', () => {
  console.log('cache-miss');
});
fetcher.on('cache-hit', () => {
  console.log('cache-hit');
});
fetcher.on('downloaded', () => {
  console.log('cache-downloaded');
});

class TreeQuery {
  cancelled = false;
  withMetadata = false;

  constructor(filters, withMetadata, onData) {
    this.filters = filters;
    this.onData = onData;
    this.withMetadata = withMetadata;
  }

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

  handleRelations(relations) {
    Object.entries(relations).forEach(([node, conditions]) => {
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

  execute(datasource) {
    fetcher.get(datasource).then((response) => {
      const triples = response.triples;
      if (this.cancelled) {
        return;
      }

      const types = {};

      const subjects = triples.reduce((acc, triple) => {
        (acc[triple.subject.value] = acc[triple.subject.value] || []).push(triple);

        if (triple.predicate.value === RDF('type').value) {
          (types[triple.object.value] = types[triple.object.value] || []).push(
            triple.subject.value
          );
        }

        return acc;
      }, {});

      const node = subjects[(types[TREE('Node').value] || [])[0]] || [];

      const relations = pipe(
        node,
        filter((triple) => triple.predicate.value === TREE('Relation').value),
        map((relation) => toObject(subjects[relation.object.value])),
        groupBy((x) => x[TREE('node').value].value)
      )();

      this.handleRelations(relations);

      // TODO: make this more generic
      const observations = (types[SOSA('Observation').value] || [])
        .map((observationSubject) => subjects[observationSubject])
        .map((observation) =>
          toObject(
            observation,
            this.withMetadata && {
              datasource,
              relations,
            }
          )
        )
        .filter((observation) => {
          const resultTime = fromRdf(observation[SOSA('resultTime').value]);

          return applyFilter(this.filters, resultTime);
        });

      this.onData(observations);
    });
  }

  cancel() {
    this.cancelled = true;
  }
}

export default TreeQuery;
