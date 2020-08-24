// Import Joi
const joi = require('joi');

// Export the joi model
module.exports = joi.object().keys({
  text: joi.string().required(),
  owner: joi.string().required(),
  status: joi.string().required(),
  due: joi.date().required(),
  updates: joi.array().items({
    created: joi.date().required(),
    userid: joi.string().required(),
    update: joi.string().required(),
  }),
  created: joi.date().required(),
  closed: joi.date(),
  userid: joi.object().required(),
  boardid: joi.object().required(),
});
