// This module checks the json web token from a user
const jwt = require('jsonwebtoken');
const jwks = require('jwks-rsa');
// Get configuration
const config = require('../config/config');
// For extracting the user
const usersService = require('../services/usersService');
const permissionsService = require('../services/permissionsService');

module.exports = async (req, res, next) => {
  // Get the header from the request
  const authHeader = req.headers.authorization || '';

  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7, authHeader.length);
    const decodedToken = jwt.decode(token, { complete: true });
    // We need a client to fetch the secret for verifying
    const secretClient = jwks({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: config.auth0.jwksUri,
    });
    // Now get the actual secret
    secretClient.getSigningKey(decodedToken.header.kid, (err, key) => {
      // Verify the token with the public key
      jwt.verify(
        token,
        key.getPublicKey(),
        {
          // Check the audience and issuer are correct
          audience: config.auth0.audience,
          issuer: config.auth0.issuer,
          algorithms: ['RS256'],
        },
        // Callback from the verification
        (err2, decoded) => {
          // If there were any errors then reject access
          if (err2) {
            res.status(401);
            return res.send();
          }
          // Yet another callback! From the users service to find the user logged in
          usersService.getById(
            decoded.sub,
            req.managementToken,
            (err3, user) => {
              // If there is no user, then reject
              if (!user) {
                res.status(401);
                return res.send();
              }
              // Otherwise attach to the request
              req.user = user;
              // Final callback (pyramid of doom!) to get the roles for the user
              permissionsService.getById(
                decoded.sub,
                req.managementToken,
                (err4, permissions) => {
                  // Attach roles to the request
                  req.user.permissions = permissions;
                  return next();
                },
              );
            },
          );
        },
      );
    });
  }
  // If there is no token
  else {
    res.status(401);
    return res.send();
  }
};
