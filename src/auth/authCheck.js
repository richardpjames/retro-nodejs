// This module checks the json web token from a user
const jwt = require('jsonwebtoken');
const jwks = require('jwks-rsa');
// Get configuration
const config = require('../config/config');
// For extracting the user
const usersService = require('../services/usersService');
const permissionsService = require('../services/permissionsService');

// Set up the client for fetching secrets
const secretClient = jwks({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
  jwksUri: config.auth0.jwksUri,
});

// Wrap the signingKey operations in a promise
const getSigningKey = (...args) => {
  return new Promise((resolve, reject) => {
    secretClient.getSigningKey(...args, (err, key) => {
      if (err) return reject(err);
      return resolve(key);
    });
  });
};
// Wrap the verify operations in a promise
const verifyToken = (...args) => {
  return new Promise((resolve, reject) => {
    jwt.verify(...args, (err, decoded) => {
      if (err) return reject(err);
      return resolve(decoded);
    });
  });
};

module.exports = async (req, res, next) => {
  // Get the header from the request
  const authHeader = req.headers.authorization || '';

  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7, authHeader.length);
    const decodedToken = jwt.decode(token, { complete: true });

    // We need a client to fetch the secret for verifying
    const key = await getSigningKey(decodedToken.header.kid);
    const publicKey = key.getPublicKey();

    try {
      const decoded = await verifyToken(token, publicKey, {
        // Check the audience and issuer are correct
        audience: config.auth0.audience,
        issuer: config.auth0.issuer,
        algorithms: ['RS256'],
      });
      const user = await usersService.getById(decoded.sub, req.managementToken);
      // If there is no user, then reject
      if (!user) {
        res.status(401);
        return res.send();
      }
      // Otherwise attach to the request
      req.user = user;
      // Final callback (pyramid of doom!) to get the roles for the user
      const permissions = await permissionsService.getById(
        decoded.sub,
        req.managementToken,
      );
      req.user.permissions = permissions;
      return next();
      // If there are any issues with verifying the token or adding data then unauthorized
    } catch (error) {
      res.status(401);
      return res.send();
    }
  }
  // If there is no token
  else {
    res.status(401);
    return res.send();
  }
};
