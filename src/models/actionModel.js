// Import Joi
const joi = require('joi');

// Export the joi model
module.exports = joi.object().keys({
  text: joi.string().required(),
  owner: joi.string().required(),
  open: joi.boolean().required(),
  due: joi.date().required(),
  created: joi.date().required(),
  userId: joi.string().required(),
  boardId: joi.object().required(),
});
