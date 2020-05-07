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

export default toObject;
