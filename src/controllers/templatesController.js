// Use the templatesService for datbase operations
const templatesService = require('../services/templatesService');

// The controller for templates
module.exports = {
  // Get all simply returns all templates from the database
  getAll: async (req, res) => {
    const templates = await templatesService.getAll();
    res.status(200);
    return res.send(templates);
  },
  // Get a single board from the ID in the params
  get: async (req, res) => {
    const template = await templatesService.getById(req.params.templateId);
    // Return 404 if the template is not found
    if (!template) {
      res.status(404);
      return res.send();
    }
    // Otherwise return the template and a 200
    res.status(200);
    return res.send(template);
  },
  // For the creation of new templates
  create: async (req, res) => {
    const template = req.body;
    // Set the created time
    template.created = Date.now();
    // Try and save the template (this will also validate the data)
    try {
      await templatesService.create(template);
      res.status(200);
      return res.send(template);
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
  // Update existing template
  update: async (req, res) => {
    // Get the template and remove the Id
    const updatedTemplate = req.body;
    delete updatedTemplate._id;
    // Get the original template
    const template = await templatesService.getById(req.params.templateId);
    // Do not allow changing the created date
    updatedTemplate.created = template.created;
    // Try and save
    try {
      // Update the board
      await templatesService.update(req.params.templateId, updatedTemplate);
      // After all affected cards are moved we can return the updated card
      res.status(200);
      return res.send(updatedTemplate);
      // Return any errors back to the user
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
};
