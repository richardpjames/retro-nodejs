// This module contains configuration options for the application
module.exports = {
  application: {
    port: process.env.PORT || 5000,
  },
  database: {
    url: process.env.MONGO_URL || 'mongodb://localhost:27017',
    redis: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  auth0: {
    issuer: process.env.AUTH0_ISSUER,
    audience: process.env.AUTH0_AUDIENCE,
    jwksUri: process.env.AUTH0_JWKS_URI,
    management: {
      clientId: process.env.AUTH0_MGMT_CLIENT_ID,
      clientSecret: process.env.AUTH0_MGMT_CLIENT_SECRET,
      audience: process.env.AUTH0_MGMT_AUDIENCE,
      grantType: process.env.AUTH0_MGMT_GRANT_TYPE,
      tokenUrl: process.env.AUTH0_MGMT_TOKEN_URL,
    },
  },
};
