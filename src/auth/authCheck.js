// This module checks the json web token from a user
const jwt = require('jsonwebtoken');
// Get configuration
const config = require('../config/config');
// Get the postgres connection
const postgres = require('../db/postgres');
// Fetch the postgres pool
const pool = postgres.pool();

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
    const result = await pool.query('SELECT * FROM users WHERE userid = $1', [
      verified.user.userid,
    ]);
    [req.user] = result.rows;
  } catch (error) {
    res.status(401);
    return res.send();
  }
  return next();
};
