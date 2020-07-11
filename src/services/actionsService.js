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
  getById: async (actionId) => {
    return db.collection('actions').findOne({ _id: actionId });
  },
  query: async (query) => {
    return db.collection('actions').find(query);
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
  update: async (actionId, action) => {
    // Validate the updated action against the model
    const errors = actionModel.validate(action);
    // If no validation errors then update the action
    if (!errors.error) {
      await db
        .collection('actions')
        .findOneAndUpdate({ _id: actionId }, action);
    } else {
      throw errors.error.details;
    }
  },
  // Remove a action from the database
  remove: async (actionId) => {
    return db.collection('actions').remove({ _id: actionId });
  },
};
