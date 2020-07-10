// Import Joi
const joi = require('joi');

// Export the joi model
module.exports = joi.object().keys({
  auth0id: joi.string().required(),
  nickname: joi.string(),
  picture: joi.string(),
});
