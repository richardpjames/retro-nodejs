// Connection to the database
const mongo = require('../db/mongo');
// The card model
const cardModel = require('../models/cardModel');
// Get the database connection
const db = mongo.db();

module.exports = {
  // Retrieve all cards
  getAll: async () => {
    return db.collection('cards').find().toArray();
  },
  // Retrieve a card using its ID
  getById: async (cardId) => {
    return db.collection('cards').findOne({ _id: cardId });
  },
  query: async (query) => {
    return db.collection('cards').find(query);
  },
  // Create a new card in the database
  create: async (card) => {
    // First validate against the model
    const errors = cardModel.validate(card);
    // If no validation errors then create the card
    if (!errors.error) {
      await db.collection('cards').insertOne(card);
    } else {
      throw errors.error.details;
    }
  },
  // Replace a card with a new one
  update: async (cardId, card) => {
    // Validate the updated card against the model
    const errors = cardModel.validate(card);
    // If no validation errors then update the card
    if (!errors.error) {
      await db.collection('cards').findOneAndUpdate({ _id: cardId }, card);
    } else {
      throw errors.error.details;
    }
  },
  // Remove a card from the database
  remove: async (cardId) => {
    return db.collection('cards').remove({ _id: cardId });
  },
};
