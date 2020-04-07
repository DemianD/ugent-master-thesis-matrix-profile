const getRelativeURI = absoluteURI => {
  const parts = absoluteURI.split('/');

  return absoluteURI.replace(`${parts[0]}//${parts[2]}`, '');
};

export default getRelativeURI;
