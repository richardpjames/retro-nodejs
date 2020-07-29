// Import Joi
const joi = require('joi');

// Export the joi model
module.exports = joi.object().keys({
  name: joi.string().required(),
  members: joi.array().items({
    email: joi.string(),
    status: joi.string(),
  }),
  created: joi.date().required(),
  userId: joi.string().required(),
});
