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
        await db.collection('boards').createIndex({ userId: 1 });
        await db.createCollection('columns', {
          collation: { locale: 'en_US', strength: 2 },
        });
        await db.collection('columns').createIndex({ boardId: 1 });
        await db.createCollection('cards', {
          collation: { locale: 'en_US', strength: 2 },
        });
        await db.collection('cards').createIndex({ boardId: 1, columnId: 1 });
        await db.createCollection('actions', {
          collation: { locale: 'en_US', strength: 2 },
        });
        await db.collection('actions').createIndex({ boardId: 1 });
        await db.createCollection('votes', {
          collation: { locale: 'en_US', strength: 2 },
        });
        await db.collection('votes').createIndex({ boardId: 1 });
        await db.collection('votes').createIndex({ cardId: 1, userId: 1 });
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
