import { RDF } from '../../utils/vocs';

const mapTriples = (triples) => {
  const types = {};

  const subjects = triples.reduce((acc, triple) => {
    (acc[triple.subject.value] = acc[triple.subject.value] || []).push(triple);

    if (triple.predicate.value === RDF('type').value) {
      (types[triple.object.value] = types[triple.object.value] || []).push(triple.subject.value);
    }

    return acc;
  }, {});

  return { types, subjects };
};

export default mapTriples;
