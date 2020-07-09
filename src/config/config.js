// This module contains configuration options for the application
module.exports = {
  application: {
    port: process.env.PORT || 5000,
  },
  database: {
    url: process.env.MONGO_URL || 'mongodb://localhost:27017',
  },
  auth0: {
    issuer: process.env.AUTH0_ISSUER,
    audience: process.env.AUTH0_AUDIENCE,
    jwks_uri: process.env.AUTH0_JWKS_URI,
  },
};
