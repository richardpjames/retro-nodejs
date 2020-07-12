// Import Joi
const joi = require('joi');
// Add ObjectId validation
joi.objectId = require('joi-objectid')(joi);

// Export the joi model
module.exports = joi.object().keys({
  text: joi.string().required(),
  created: joi.date().required(),
  actionId: joi.objectId().required(),
  boardId: joi.objectId().required(),
});
