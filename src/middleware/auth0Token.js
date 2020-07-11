// Use axios for making http requests
const axios = require('axios');
// For checking the validity of the exisiting token
const jwt = require('jsonwebtoken');
// Fetch configuration
const config = require('../config/config');

// For holding the saved access token
let accessToken;

module.exports = async (req, res, next) => {
  // For holding the decoded access token so that we can check it
  let decoded;
  // If we already have a token then decode and check the expiry
  if (accessToken) {
    decoded = await jwt.decode(accessToken);
  }
  // We only need to request the token again if we don't have it, or it has expired
  if (!accessToken || Date.now() > decoded.exp * 1000) {
    // To request the token we need the following body
    const requestBody = {
      client_id: config.auth0.management.clientId,
      client_secret: config.auth0.management.clientSecret,
      audience: config.auth0.management.audience,
      grant_type: config.auth0.management.grantType,
    };
    // Make the post request
    const response = await axios.post(
      config.auth0.management.tokenUrl,
      requestBody,
    );
    // Set the new access token
    accessToken = response.data.access_token;
  }
  // Attach the access token to the request
  req.managementToken = accessToken;
  next();
};
