// Import Joi
const joi = require('joi');

// Export the joi model
module.exports = joi.object().keys({
  _id: joi.object(),
  text: joi.string().required(),
  order: joi.number().required(),
  created: joi.date().required(),
  userId: joi.string().required(),
  columnId: joi.object().required(),
  boardId: joi.object().required(),
});
