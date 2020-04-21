import ldfetch from 'ldfetch';
import { pipe, map, filter, toArray } from 'lazy-collections';

import { fromRdf } from 'rdf-literal';
import { TREE, RDF, SOSA } from '../utils/vocs';

export const GREATER_THAN_OR_EQUAL_TO = TREE('GreaterOrEqualThanRelation');
export const GREATER_THAN = TREE('GreaterThanRelation');
export const LESS_THAN = TREE('LessThanRelation');
export const LESS_THAN_OR_EQUAL_TO = TREE('LessOrEqualThanRelation');

const toObject = (subjectTriples) => {
  return subjectTriples.reduce((acc, triple) => {
    if (acc[triple.predicate.value]) {
      acc[triple.predicate.value] = [...acc[triple.predicate.value], triple.object];
    } else {
      acc[triple.predicate.value] = triple.object;
    }

    return acc;
  }, {});
};

const fetcher = new ldfetch();

fetcher.on('cache-miss', (obj) => {
  console.log('cache-miss');
});
fetcher.on('cache-hit', (obj) => {
  console.log('cache-hit');
});
fetcher.on('downloaded', (obj) => {
  console.log('cache-downloaded');
});

class TreeQuery {
  cancelled = false;

  constructor(filters, onData) {
    this.filters = filters;
    this.onData = onData;
  }

  filterValues(value, isLeft) {
    return this.filters.some((filter) => {
      const filterValue = filter.value;

      switch (filter['relationType'].value) {
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
    relations
      .filter((relation) => {
        const relationType = relation[RDF('type').value].value;
        const relationValue = fromRdf(relation[TREE('value').value]);

        const isLeft =
          relationType === LESS_THAN.value || relationType === LESS_THAN_OR_EQUAL_TO.value;

        return this.filterValues(relationValue, isLeft);
      })
      .forEach((relation) => {
        this.execute(relation[TREE('Node').value].value);
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

      const node = subjects[(types[TREE('Node').value] || [])[0]];

      const relations = pipe(
        node,
        filter((triple) => triple.predicate.value === TREE('relation').value),
        map((relation) => subjects[relation.object.value]),
        map((relation) => toObject(relation)),
        toArray()
      )();

      relations.length > 0 && this.handleRelations(relations);

      // TODO: make this more generic
      const observations = (types[SOSA('Observation').value] || [])
        .map((observationSubject) => subjects[observationSubject])
        .map((observation) => toObject(observation))
        .filter((observation) => {
          const resultTime = fromRdf(observation[SOSA('resultTime').value]);

          return this.filters.every((filter) => {
            const filterValue = filter.value;

            switch (filter['relationType'].value) {
              case LESS_THAN.value:
                return resultTime < filterValue;
              case LESS_THAN_OR_EQUAL_TO.value:
                return resultTime <= filterValue;
              case GREATER_THAN.value:
                return resultTime > filterValue;
              case GREATER_THAN_OR_EQUAL_TO.value:
                return resultTime >= filterValue;
              default:
                throw new Error('Relation type not supported');
            }
          });
        });

      this.onData(observations);
    });
  }

  cancel() {
    this.cancelled = true;
  }
}

export default TreeQuery;
