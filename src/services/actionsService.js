// For generating object Ids
const { ObjectId } = require('mongodb');
// Connection to the database
const mongo = require('../db/mongo');
// The action model
const actionModel = require('../models/actionModel');
// Get the database connection
const db = mongo.db();

module.exports = {
  // Retrieve all actions
  getAll: async () => {
    return db.collection('actions').find().toArray();
  },
  // Retrieve a action using its ID
  getById: async (actionid) => {
    return db.collection('actions').findOne({ _id: ObjectId(actionid) });
  },
  query: async (query) => {
    return db.collection('actions').find(query).toArray();
  },
  // Create a new action in the database
  create: async (action) => {
    // First validate against the model
    const errors = actionModel.validate(action);
    // If no validation errors then create the action
    if (!errors.error) {
      await db.collection('actions').insertOne(action);
    } else {
      throw errors.error.details;
    }
  },
  // Replace a action with a new one
  update: async (actionid, action) => {
    // Validate the updated action against the model
    const errors = actionModel.validate(action);
    // If no validation errors then update the action
    if (!errors.error) {
      await db
        .collection('actions')
        .replaceOne({ _id: ObjectId(actionid) }, action);
    } else {
      throw errors.error.details;
    }
  },
  // Remove a action from the database
  remove: async (actionid) => {
    return db.collection('actions').deleteOne({ _id: ObjectId(actionid) });
  },
};
