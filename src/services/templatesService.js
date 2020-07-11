// For generating object Ids
const { ObjectId } = require('mongodb');
// Connection to the database
const mongo = require('../db/mongo');
// The template model
const templateModel = require('../models/templateModel');
// Get the database connection
const db = mongo.db();

module.exports = {
  // Retrieve all templates
  getAll: async () => {
    return db.collection('templates').find().toArray();
  },
  // Retrieve a template using its ID
  getById: async (templateId) => {
    return db.collection('templates').findOne({ _id: ObjectId(templateId) });
  },
  query: async (query) => {
    return db.collection('templates').find(query);
  },
  // Create a new template in the database
  create: async (template) => {
    // First validate against the model
    const errors = templateModel.validate(template);
    // If no validation errors then create the template
    if (!errors.error) {
      await db.collection('templates').insertOne(template);
    } else {
      throw errors.error.details;
    }
  },
  // Replace a template with a new one
  update: async (templateId, template) => {
    // Validate the updated template against the model
    const errors = templateModel.validate(template);
    // If no validation errors then update the template
    if (!errors.error) {
      await db
        .collection('templates')
        .findOneAndUpdate({ _id: ObjectId(templateId) }, template);
    } else {
      throw errors.error.details;
    }
  },
  // Remove a template from the database
  remove: async (templateId) => {
    return db.collection('templates').remove({ _id: ObjectId(templateId) });
  },
};
