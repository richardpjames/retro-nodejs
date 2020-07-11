// For generating object Ids
const { ObjectId } = require('mongodb');
// Connection to the database
const mongo = require('../db/mongo');
// The user model
const userModel = require('../models/userModel');
// Get the database connection
const db = mongo.db();

module.exports = {
  // Retrieve all users
  getAll: async () => {
    return db.collection('users').find().toArray();
  },
  // Retrieve a user using its ID
  getById: async (userId) => {
    return db.collection('users').findOne({ _id: ObjectId(userId) });
  },
  query: async (query) => {
    return db.collection('users').find(query);
  },
  // Create a new user in the database
  create: async (user) => {
    // First validate against the model
    const errors = userModel.validate(user);
    // If no validation errors then create the user
    if (!errors.error) {
      await db.collection('users').insertOne(user);
    } else {
      throw errors.error.details;
    }
  },
  // Replace a user with a new one
  update: async (userId, user) => {
    // Validate the updated user against the model
    const errors = userModel.validate(user);
    // If no validation errors then update the user
    if (!errors.error) {
      await db
        .collection('users')
        .findOneAndUpdate({ _id: ObjectId(userId) }, user);
    } else {
      throw errors.error.details;
    }
  },
  // Remove a user from the database
  remove: async (userId) => {
    return db.collection('users').remove({ _id: ObjectId(userId) });
  },
};
