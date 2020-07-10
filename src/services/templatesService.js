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
    return db.collection('templates').findOne({ _id: templateId });
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
  // Remove a template from the database
  remove: async (templateId) => {
    return db.collection('templates').remove({ _id: templateId });
  }
};
