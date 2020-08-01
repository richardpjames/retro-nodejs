// Import Joi
const joi = require('joi');

// Export the joi model
module.exports = joi.object().keys({
  name: joi.string().required(),
  description: joi.string().required(),
  maxVotes: joi.number().integer().min(0).required(),
  created: joi.date().required(),
  userId: joi.string().required(),
  teamId: joi.object(),
  private: joi.boolean().required(),
});
