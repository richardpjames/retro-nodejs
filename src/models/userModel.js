// Import Joi
const joi = require('joi');

// Export the joi model
module.exports = joi.object().keys({
  email: joi.string().required(),
  password: joi.string().required(),
  nickname: joi.string().required(),
  resetToken: joi.string(),
});
