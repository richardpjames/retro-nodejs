// For hasing passwords
const bcrypt = require('bcrypt');
// For generating object Ids
const { ObjectId } = require('mongodb');
// Get the model for the users
const userModel = require('../models/userModel');
// Connection to the database
const mongo = require('../db/mongo');
// Get the database connection
const db = mongo.db();

module.exports = {
  // Retrieve all users - redis does not support async await so use callbacks
  getAll: async () => {
    return db.collection('users').find().toArray();
  },
  // Retrieve a user using its ID - redis does not support async await so use callbacks
  getById: async (userid) => {
    return db.collection('users').findOne({ _id: ObjectId(userid) });
  },
  getByEmail: async (email) => {
    return db.collection('users').findOne({ email });
  },
  create: async (user) => {
    // First validate against the model
    const errors = userModel.validate(user);
    // Now hash the password
    user.password = await bcrypt.hash(user.password, 10);
    // If no validation errors then create the board
    if (!errors.error) {
      return db.collection('users').insertOne(user);
    }
    throw errors.error.details;
  },
  update: async (userid, user, hashPassword = false) => {
    // If there is a new password it needs to be hashed
    if (hashPassword) {
      user.password = await bcrypt.hash(user.password, 10);
    }
    // Validate the updated card against the model
    const errors = userModel.validate(user);
    // If no validation errors then update the card
    if (!errors.error) {
      await db.collection('users').replaceOne({ _id: ObjectId(userid) }, user);
    } else {
      throw errors.error.details;
    }
  },
  checkPassword: async (user, password) => {
    // use bcrypt to compare the password to that saved
    const compare = await bcrypt.compare(password, user.password);
    return compare;
  },
};
