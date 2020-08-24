// Import Joi
const joi = require('joi');

// Export the joi model
module.exports = joi.object().keys({
  name: joi.string().required(),
  description: joi.string().required(),
  instructions: joi.string(),
  maxvotes: joi.number().integer().min(0).required(),
  created: joi.date().required(),
  userid: joi.object().required(),
  teamid: joi.object(),
  private: joi.boolean().required(),
  showactions: joi.boolean().required(),
  allowvotes: joi.boolean(),
  showinstructions: joi.boolean(),
  locked: joi.boolean(),
});
