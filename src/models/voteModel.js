// Import Joi
const joi = require('joi');
// Add ObjectId validation
joi.objectId = require('joi-objectid')(joi);

// Export the joi model
module.exports = joi.object().keys({
  created: joi.date().required(),
  userId: joi.string().required(),
  boardId: joi.objectId().required(),
  cardId: joi.objectId().required(),
});
