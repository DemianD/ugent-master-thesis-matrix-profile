const c = (...classes) => {
  return classes.filter(className => !!className).join(' ');
};

export default c;
