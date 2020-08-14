// Import Joi
const joi = require('joi');

// Export the joi model
module.exports = joi.object().keys({
  _id: joi.object(),
  text: joi.string().required(),
  rank: joi.string().required(),
  created: joi.date().required(),
  userId: joi.string().required(),
  columnId: joi.object().required(),
  boardId: joi.object().required(),
  colour: joi.string().required(),
  combinedCards: joi.array().items({
    userId: joi.string().required(),
    text: joi.string().required(),
    colour: joi.string().required(),
  }),
});
