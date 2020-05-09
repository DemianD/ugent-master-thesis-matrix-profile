import { LESS_THAN, LESS_THAN_OR_EQUAL_TO, GREATER_THAN, GREATER_THAN_OR_EQUAL_TO } from '../Query';

const applyFilters = (filters, value) => {
  return filters.every((filter) => {
    const filterValue = filter.value;

    switch (filter['relationType'].value) {
      case LESS_THAN.value:
        return value < filterValue;
      case LESS_THAN_OR_EQUAL_TO.value:
        return value <= filterValue;
      case GREATER_THAN.value:
        return value > filterValue;
      case GREATER_THAN_OR_EQUAL_TO.value:
        return value >= filterValue;
      default:
        throw new Error('Relation type not supported');
    }
  });
};

export default applyFilters;
