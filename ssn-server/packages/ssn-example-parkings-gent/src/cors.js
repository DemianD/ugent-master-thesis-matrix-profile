const cors = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');

  return next();
};

export default cors;
