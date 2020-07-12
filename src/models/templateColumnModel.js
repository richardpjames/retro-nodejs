// Import Joi
const joi = require('joi');
// Add ObjectId validation
joi.objectId = require('joi-objectid')(joi);

// Export the joi model
module.exports = joi.object().keys({
  title: joi.string().required(),
  order: joi.number().required(),
  created: joi.date().required(),
  templateId: joi.objectId().required(),
});
