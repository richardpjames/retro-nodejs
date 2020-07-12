// For generating object Ids
const { ObjectId } = require('mongodb');
// Connection to the database
const mongo = require('../db/mongo');
// The vote model
const voteModel = require('../models/voteModel');
// Get the database connection
const db = mongo.db();

module.exports = {
  // Retrieve all votes
  getAll: async () => {
    return db.collection('votes').find().toArray();
  },
  // Retrieve a vote using its ID
  getById: async (voteId) => {
    return db.collection('votes').findOne({ _id: ObjectId(voteId) });
  },
  query: async (query) => {
    return db.collection('votes').find(query).toArray();
  },
  // Create a new vote in the database
  create: async (vote) => {
    // First validate against the model
    const errors = voteModel.validate(vote);
    // If no validation errors then create the vote
    if (!errors.error) {
      await db.collection('votes').insertOne(vote);
    } else {
      throw errors.error.details;
    }
  },
  // Replace a vote with a new one
  update: async (voteId, vote) => {
    // Validate the updated vote against the model
    const errors = voteModel.validate(vote);
    // If no validation errors then update the vote
    if (!errors.error) {
      await db.collection('votes').replaceOne({ _id: ObjectId(voteId) }, vote);
    } else {
      throw errors.error.details;
    }
  },
  // Remove a vote from the database
  remove: async (voteId) => {
    return db.collection('votes').deleteOne({ _id: ObjectId(voteId) });
  },
};
