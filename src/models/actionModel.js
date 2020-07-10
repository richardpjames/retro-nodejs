// Import Joi
const joi = require('joi');

// Export the joi model
module.exports = joi.object().keys({
  text: joi.string().required(),
  owner: joi.string().required(),
  user: joi.string().required(),
  open: joi.boolean(),
  due: joi.date().required(),
  created: joi.date().required(),
  boardId: joi.string().required(),
});
