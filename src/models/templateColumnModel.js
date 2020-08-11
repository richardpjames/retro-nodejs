// Import Joi
const joi = require('joi');

// Export the joi model
module.exports = joi.object().keys({
  title: joi.string().required(),
  rank: joi.string().required(),
  created: joi.date().required(),
  templateId: joi.object().required(),
});
