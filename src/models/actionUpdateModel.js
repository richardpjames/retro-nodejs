// Import Joi
const joi = require('joi');

// Export the joi model
module.exports = joi.object().keys({
  text: joi.string().required(),
  created: joi.date().required(),
  actionId: joi.string().required(),
  boardId: joi.string().required(),
});
