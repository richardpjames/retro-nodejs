// Import Joi
const joi = require('joi');

// Export the joi model
module.exports = joi.object().keys({
  name: joi.string().required(),
  description: joi.string().required(),
  instructions: joi.string().required(),
  maxvotes: joi.number().integer().min(0).required(),
  created: joi.date().required(),
});
