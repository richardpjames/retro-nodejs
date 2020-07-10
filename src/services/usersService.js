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
};
