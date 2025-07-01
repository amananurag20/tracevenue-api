const configureServer = () => {
  const PORT = process.env.PORT || 5000; // Set the default port
  const MONGODB_URL = process.env.MONGODB_URL;

  return {
    PORT,
    MONGODB_URL,
  };
};

module.exports = configureServer;
