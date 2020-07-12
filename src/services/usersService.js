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

module.exports = {
  // Retrieve all users - redis does not support async await so use callbacks
  getAll: async (token, callback) => {
    const redisKey = 'api:users';
    // First try and get the user from the redis cache
    db.get(redisKey, async (err, users) => {
      // If the users were in the cache then return them
      if (users) return callback(null, JSON.parse(users));
      // Otherwise get from the API
      try {
        const auth0users = await axios.get(
          `${config.auth0.management.audience}users`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        // If there was a user returned from the API then save them in the cache
        if (auth0users.data) {
          // Set expiry of 300 (5 mins)
          db.setex(redisKey, 300, JSON.stringify(auth0users.data));
          return callback(null, auth0users.data);
        }
        // If there was no user data then return null
        return callback('No users found', null);
      } catch (error) {
        debug(error);
        return callback(error, null);
      }
    });
  },
  // Retrieve a user using its ID - redis does not support async await so use callbacks
  getById: async (userId, token, callback) => {
    const redisKey = `users:${userId}`;
    // First try and get the user from the redis cache
    db.get(redisKey, async (err, user) => {
      // If ths user was in the cache then return them
      if (user) return callback(null, JSON.parse(user));
      // Otherwise get from the API
      try {
        const auth0user = await axios.get(
          `${config.auth0.management.audience}users/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        // If there was a user returned from the API then save them in the cache
        if (auth0user.data) {
          // Set expiry of 3600 (1 hour)
          db.setex(redisKey, 3600, JSON.stringify(auth0user.data));
          return callback(null, auth0user.data);
        }
        // If there was no user then return null
        return callback('User not found', null);
      } catch (error) {
        debug(error);
        return callback(error, null);
      }
    });
  },
};
