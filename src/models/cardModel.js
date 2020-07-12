// Import Joi
const joi = require('joi');
// Add ObjectId validation
joi.objectId = require('joi-objectid')(joi);

// Export the joi model
module.exports = joi.object().keys({
  text: joi.string().required(),
  order: joi.number().required(),
  created: joi.date().required(),
  userId: joi.string().required(),
  columnId: joi.objectId().required(),
  boardId: joi.objectId().required(),
});
