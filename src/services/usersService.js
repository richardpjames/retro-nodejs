// Axios is used for fetching data
const axios = require('axios');
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
  // Retrieve all users - redis does not support async await so use callbacks
  getAll: async (token) => {
    const redisKey = 'api:users';

    // First try and get the user from the redis cache
    const users = await getFromRedis(redisKey);
    // If found then return
    if (users) return JSON.parse(users);

    // Otherwise get from the API
    const auth0users = await axios.get(
      `${config.auth0.management.audience}users`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    // If there was a user returned from the API then save them in the cache
    if (auth0users.data) {
      db.setex(
        redisKey,
        config.redis.shortExpiryTime,
        JSON.stringify(auth0users.data),
      );
      return auth0users.data;
    }
    // If there was no user data then return null
    return null;
  },
  // Retrieve a user using its ID - redis does not support async await so use callbacks
  getById: async (userId, token) => {
    const redisKey = `users:${userId}`;
    // First try and get the user from the redis cache
    const user = await getFromRedis(redisKey);
    if (user) return JSON.parse(user);
    // Otherwise get from the API
    const auth0user = await axios.get(
      `${config.auth0.management.audience}users/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    // If there was a user returned from the API then save them in the cache
    if (auth0user.data) {
      // Determine the correct subscription for the user
      auth0user.data.plan = 'free';
      if (
        auth0user.data.app_metadata &&
        auth0user.data.app_metadata.cancellation_date &&
        Date.parse(auth0user.data.app_metadata.cancellation_date) > Date.now()
      ) {
        auth0user.data.plan = 'professional';
      }
      // Get details of the subscription from paddle if there is one
      if (
        auth0user.data.app_metadata &&
        auth0user.data.app_metadata.subscription_id
      ) {
        // Need to supply paddle with the subscription Id from the user metadata
        const paddleRequest = {
          vendor_id: config.paddle.vendorId,
          vendor_auth_code: config.paddle.vendorAuthCode,
          subscription_id: auth0user.data.app_metadata.subscription_id,
        };
        // Get the details back from paddle
        const subscriptionDetails = await axios.get(config.paddle.usersURL, {
          params: { ...paddleRequest },
        });
        // Attach to the exisitng user
        if (subscriptionDetails.data.response) {
          // eslint-disable-next-line prefer-destructuring
          auth0user.data.subscription = subscriptionDetails.data.response[0];
        }
      }
      // Set expiry of 3600 (1 hour)
      db.setex(
        redisKey,
        config.redis.expiryTime,
        JSON.stringify(auth0user.data),
      );
      return auth0user.data;
    }
    // If there was no user then return null
    return null;
  },
  updateAppMetaData: async (userId, metadataKey, metadataValue, token) => {
    // We're updating this user, so remove from the cache
    const redisKey = `users:${userId}`;
    db.del(redisKey);
    // This is the data to include in the patch
    const data = { app_metadata: { [metadataKey]: metadataValue } };
    await axios.patch(
      `${config.auth0.management.audience}users/${userId}`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    // For now return null
    return null;
  },
  clearCache: async (userId) => {
    const redisKey = `users:${userId}`;
    return db.del(redisKey);
  },
};
