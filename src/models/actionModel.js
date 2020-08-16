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
    userId: joi.string().required(),
    update: joi.string().required(),
  }),
  created: joi.date().required(),
  closed: joi.date(),
  userId: joi.string().required(),
  boardId: joi.object().required(),
});
