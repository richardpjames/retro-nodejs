// Import Joi
const joi = require('joi');

// Export the joi model
module.exports = joi.object().keys({
  name: joi.string().required(),
  description: joi.string().required(),
  templateId: joi.string().required(),
});