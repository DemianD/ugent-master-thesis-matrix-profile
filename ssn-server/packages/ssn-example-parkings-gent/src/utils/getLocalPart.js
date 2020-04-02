const getLocalPart = IRI => {
  const lastSegment = IRI.substring(IRI.lastIndexOf('/') + 1);
  const hashIndex = lastSegment.lastIndexOf('#');

  if (hashIndex == -1) {
    return lastSegment;
  }

  return lastSegment.substring(hashIndex + 1);
};

export default getLocalPart;
