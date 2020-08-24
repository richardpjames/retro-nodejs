// Get the mongo client from mongodb
const { MongoClient } = require('mongodb');
// Get configuration
const config = require('../config/config');

// This variable will hold the database connection
let db;

const mongo = {
  // This performs the initial connection to the database (from index.js)
  connectToServer: (callback) => {
    MongoClient.connect(
      config.database.url,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      // Callback from the connection to database
      async (err, client) => {
        // Connect to the retrospectacle database
        db = client.db();
        // Create rach of the required collections
        await db.createCollection('boards', {
          collation: { locale: 'en_US', strength: 2 },
        });
        await db.collection('boards').createIndex({ userid: 1 });
        await db.createCollection('columns', {
          collation: { locale: 'en_US', strength: 2 },
        });
        await db.collection('columns').createIndex({ boardid: 1 });
        await db.createCollection('cards', {
          collation: { locale: 'en_US', strength: 2 },
        });
        await db.collection('cards').createIndex({ boardid: 1, columnid: 1 });
        await db.createCollection('actions', {
          collation: { locale: 'en_US', strength: 2 },
        });
        await db.collection('actions').createIndex({ boardid: 1 });
        await db.createCollection('votes', {
          collation: { locale: 'en_US', strength: 2 },
        });
        await db.collection('votes').createIndex({ boardid: 1 });
        await db.collection('votes').createIndex({ cardid: 1, userid: 1 });
        await db.createCollection('teams', {
          collation: { locale: 'en_US', strength: 2 },
        });
        await db.collection('teams').createIndex({ members: 1 });
        await db.createCollection('templates', {
          collation: { locale: 'en_US', strength: 2 },
        });
        await db.createCollection('templateColumns', {
          collation: { locale: 'en_US', strength: 2 },
        });
        await db.createCollection('users', {
          collation: { locale: 'en_US', strength: 2 },
        });
        await db.collection('users').createIndex({ email: 1 });
        callback();
      },
    );
  },
  // This function can be used to retrieve the single db connection at any time
  db: () => {
    return db;
  },
};

module.exports = mongo;
