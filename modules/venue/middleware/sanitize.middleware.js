const sanitizeData = (req, res, next) => {
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      } else if (typeof obj[key] === 'string') {
        obj[key] = obj[key].trim();
      }
    }
  };

  if (req.body) {
    sanitizeObject(req.body);
  }
  next();
};

module.exports = { sanitizeData };
