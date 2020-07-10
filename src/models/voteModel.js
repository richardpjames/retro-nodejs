// Import Joi
const joi = require('joi');

// Export the joi model
module.exports = joi.object().keys({
  created: joi.date().required(),
  userId: joi.string().required(),
  boardId: joi.string().required(),
  cardId: joi.string().required(),
});
