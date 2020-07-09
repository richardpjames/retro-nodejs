// Get the mongo client from mongodb
const { MongoClient } = require('mongodb');
// Get configuration
const config = require('../config/config');

// This variable will hold the database connection
let db;

const mongo = {
  // This performs the initial connection to the database (from index.js)
  connectToServer: async () => {
    db = await MongoClient.connect(config.database.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  },

  // This function can be used to retrieve the single db connection at any time
  getDatabase: () => {
    return db;
  },
};

module.exports = mongo;
