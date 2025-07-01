const sanitizeDataHelper = (updateData, validFields) => {
  const sanitizedData = Object.keys(updateData)
    .filter((key) => validFields.includes(key))
    .reduce((acc, key) => {
      acc[key] = updateData[key];
      return acc;
    }, {});
  return sanitizedData;
};

module.exports = { sanitizeDataHelper };
