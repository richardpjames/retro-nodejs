// Import Joi
const joi = require('joi');

// Export the joi model
module.exports = joi.object().keys({
  text: joi.string().required(),
  created: joi.date().required(),
  actionId: joi.object().required(),
  boardId: joi.object().required(),
});
