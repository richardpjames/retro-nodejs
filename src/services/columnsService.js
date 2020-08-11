// For generating object Ids
const { ObjectId } = require('mongodb');
// Connection to the database
const mongo = require('../db/mongo');
// The column model
const columnModel = require('../models/columnModel');
// Get the database connection
const db = mongo.db();

module.exports = {
  // Retrieve all columns
  getAll: async () => {
    return db.collection('columns').find().toArray();
  },
  // Retrieve a column using its ID
  getById: async (columnId) => {
    return db.collection('columns').findOne({ _id: ObjectId(columnId) });
  },
  query: async (query) => {
    return db.collection('columns').find(query).toArray();
  },
  // Create a new column in the database
  create: async (column) => {
    // First validate against the model
    const errors = columnModel.validate(column);
    // If no validation errors then create the column
    if (!errors.error) {
      return db.collection('columns').insertOne(column);
    }
    throw errors.error.details;
  },
  // Replace a column with a new one
  update: async (columnId, column) => {
    // Validate the updated column against the model
    const errors = columnModel.validate(column);
    // If no validation errors then update the column
    if (!errors.error) {
      await db
        .collection('columns')
        .replaceOne({ _id: ObjectId(columnId) }, column);
    } else {
      throw errors.error.details;
    }
  },
  // Remove a column from the database
  remove: async (columnId) => {
    return db.collection('columns').deleteOne({ _id: ObjectId(columnId) });
  },
  // Remove all of the columns based on a query
  removeQuery: async (query) => {
    return db.collection('columns').deleteMany(query);
  },
};
