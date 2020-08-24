// Import Joi
const joi = require('joi');

// Export the joi model
module.exports = joi.object().keys({
  name: joi.string().required(),
  members: joi.array().items({
    email: joi.string(),
    status: joi.string().valid('invited', 'accepted'),
  }),
  created: joi.date().required(),
  userid: joi.object().required(),
});
