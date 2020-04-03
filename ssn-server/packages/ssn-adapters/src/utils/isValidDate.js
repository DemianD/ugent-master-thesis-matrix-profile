const isValidDate = date => {
  return date instanceof Date && !isNaN(date);
};

export default isValidDate;
