// This module checks the json web token from a user
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');
// Get configuration
const config = require('../config/config');

/* This is taken directly from the auth0 documentation, adding this middleware to the 
routes will secure them and add the user details to req.user */
module.exports = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: config.auth0.jwksUri,
  }),
  audience: config.auth0.audience,
  issuer: config.auth0.issuer,
  algorithms: ['RS256'],
});
