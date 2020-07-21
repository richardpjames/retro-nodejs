// Get the mongo client from mongodb
const redis = require('redis');
// Get configuration
const config = require('../config/config');

// This variable will hold the database connection
let db;

const redisCache = {
  // This performs the initial connection to the database (from index.js)
  connectToServer: async (callback) => {
    db = await redis.createClient(config.database.redis);
    callback();
  },

  // This function can be used to retrieve the single db connection at any time
  db: () => {
    return db;
  },
};

module.exports = redisCache;
