// Import Joi
const joi = require('joi');

// Export the joi model
module.exports = joi.object().keys({
  created: joi.date().required(),
  userid: joi.object().required(),
  boardid: joi.object().required(),
  cardid: joi.object().required(),
});
