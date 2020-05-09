const toObject = (subject, subjectTriples, metadata) => {
  const initialObject = metadata ? { __meta: metadata, subject } : { subject };

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
