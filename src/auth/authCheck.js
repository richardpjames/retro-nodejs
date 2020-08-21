// This module checks the json web token from a user
const jwt = require('jsonwebtoken');
// Get configuration
const config = require('../config/config');
// For extracting the user
const usersService = require('../services/usersService');
// const permissionsService = require('../services/permissionsService');

module.exports = async (req, res, next) => {
  // For storing the token
  let { token } = req.cookies;
  // If not set then try the bearer token
  if (!token) {
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7, authHeader.length);
    }
    // If there is still not token then reject
    if (!token) {
      res.status(401);
      return res.send();
    }
  }
  try {
    // Verify the token
    const verified = jwt.verify(token, config.jwt.secret);
    // Add the user to the request
    req.user = await usersService.getById(verified.user._id);
  } catch (error) {
    res.status(401);
    return res.send();
  }
  next();
};
