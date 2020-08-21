// Import Joi
const joi = require('joi');

// Export the joi model
module.exports = joi.object().keys({
  created: joi.date().required(),
  userId: joi.object().required(),
  boardId: joi.object().required(),
  cardId: joi.object().required(),
});
