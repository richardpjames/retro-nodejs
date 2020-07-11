// Connection to the database
const mongo = require('../db/mongo');
// The templateColumn model
const templateColumnModel = require('../models/templateColumnModel');
// Get the database connection
const db = mongo.db();

module.exports = {
  // Retrieve all templateColumns
  getAll: async () => {
    return db.collection('templateColumns').find().toArray();
  },
  // Retrieve a templateColumn using its ID
  getById: async (templateColumnId) => {
    return db.collection('templateColumns').findOne({ _id: templateColumnId });
  },
  query: async (query) => {
    return db.collection('templateColumns').find(query);
  },
  // Create a new templateColumn in the database
  create: async (templateColumn) => {
    // First validate against the model
    const errors = templateColumnModel.validate(templateColumn);
    // If no validation errors then create the templateColumn
    if (!errors.error) {
      await db.collection('templateColumns').insertOne(templateColumn);
    } else {
      throw errors.error.details;
    }
  },
  // Replace a templateColumn with a new one
  update: async (templateColumnId, templateColumn) => {
    // Validate the updated templateColumn against the model
    const errors = templateColumnModel.validate(templateColumn);
    // If no validation errors then update the templateColumn
    if (!errors.error) {
      await db
        .collection('templateColumns')
        .findOneAndUpdate({ _id: templateColumnId }, templateColumn);
    } else {
      throw errors.error.details;
    }
  },
  // Remove a templateColumn from the database
  remove: async (templateColumnId) => {
    return db.collection('templateColumns').remove({ _id: templateColumnId });
  },
};
