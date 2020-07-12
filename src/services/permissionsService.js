// Axios is used for fetching data
const axios = require('axios');
// Debug for errors
const debug = require('debug')('app:usersService');

// Connection to the redis cache
const redis = require('../db/redis');
// Configuration is required to connect to auth0
const config = require('../config/config');

// Get the database connection
const db = redis.db();

// Wrap redis operations in a promise
const getFromRedis = (...args) => {
  return new Promise((resolve, reject) => {
    db.get(...args, (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    });
  });
};

module.exports = {
  // Retrieve a set of roles using the user ID - redis does not support async await so use callbacks
  getById: async (userId, token) => {
    const redisKey = `permissions:${userId}`;
    // First try and get the user from the redis cache
    const permissions = await getFromRedis(redisKey);
    // If this users roles were in the cache then return them
    if (permissions) return JSON.parse(permissions);
    // Otherwise get from the API
    const auth0permissions = await axios.get(
      `${config.auth0.management.audience}users/${userId}/permissions`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    // If there was a user returned from the API then save them in the cache
    if (auth0permissions.data) {
      // Set expiry of 3600 (1 hour)
      db.setex(redisKey, 3600, JSON.stringify(auth0permissions.data));
      return auth0permissions.data;
    }
    // If there was no user then return null
    return null;
  },
};
