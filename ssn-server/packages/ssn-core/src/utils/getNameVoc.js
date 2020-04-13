const getNameVoc = absoluteURI => {
  let parts = absoluteURI.split('#');

  if (parts.length > 1) {
    return parts[1];
  }

  parts = absoluteURI.split('/');

  return parts[parts.length - 1];
};

export default getNameVoc;
