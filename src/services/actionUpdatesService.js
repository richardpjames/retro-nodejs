// For generating object Ids
const { ObjectId } = require('mongodb');
// Connection to the database
const mongo = require('../db/mongo');
// The actionUpdate model
const actionUpdateModel = require('../models/actionUpdateModel');
// Get the database connection
const db = mongo.db();

module.exports = {
  // Retrieve all actionUpdates
  getAll: async () => {
    return db.collection('actionUpdates').find().toArray();
  },
  // Retrieve a actionUpdate using its ID
  getById: async (actionUpdateId) => {
    return db
      .collection('actionUpdates')
      .findOne({ _id: ObjectId(actionUpdateId) });
  },
  query: async (query) => {
    return db.collection('actionUpdates').find(query);
  },
  // Create a new actionUpdate in the database
  create: async (actionUpdate) => {
    // First validate against the model
    const errors = actionUpdateModel.validate(actionUpdate);
    // If no validation errors then create the actionUpdate
    if (!errors.error) {
      await db.collection('actionUpdates').insertOne(actionUpdate);
    } else {
      throw errors.error.details;
    }
  },
  // Replace a actionUpdate with a new one
  update: async (actionUpdateId, actionUpdate) => {
    // Validate the updated actionUpdate against the model
    const errors = actionUpdateModel.validate(actionUpdate);
    // If no validation errors then update the actionUpdate
    if (!errors.error) {
      await db
        .collection('actionUpdates')
        .findOneAndUpdate({ _id: ObjectId(actionUpdateId) }, actionUpdate);
    } else {
      throw errors.error.details;
    }
  },
  // Remove a actionUpdate from the database
  remove: async (actionUpdateId) => {
    return db
      .collection('actionUpdates')
      .remove({ _id: ObjectId(actionUpdateId) });
  },
};
