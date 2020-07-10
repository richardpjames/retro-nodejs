// Import Joi
const joi = require('joi');

// Export the joi model
module.exports = joi.object().keys({
  title: joi.string().required(),
  order: joi.number().required(),
  created: joi.date().required(),
  boardId: joi.number().required(),
});
