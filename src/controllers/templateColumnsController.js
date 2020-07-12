// Use the templatesService for datbase operations
const { ObjectId } = require('mongodb');
const templateColumnsService = require('../services/templateColumnsService');

// The controller for templates
module.exports = {
  // Get all simply returns all templates from the database
  getAll: async (req, res) => {
    const templateComlumns = await templateColumnsService.query({
      templateId: ObjectId(req.params.templateId),
    });
    res.status(200);
    return res.send(templateComlumns);
  },
  // For the creation of new templates
  create: async (req, res) => {
    const templateColumn = req.body;
    // Set the created time
    templateColumn.created = Date.now();
    templateColumn.templateId = ObjectId(req.params.templateId);
    // Try and save the template (this will also validate the data)
    try {
      await templateColumnsService.create(templateColumn);
      res.status(200);
      return res.send(templateColumn);
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
};
