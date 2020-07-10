// Connection to the database
const mongo = require('../db/mongo');
// The board model
const boardModel = require('../models/boardModel');
// Get the database connection
const db = mongo.db();

module.exports = {
  // Retrieve all boards
  getAll: async () => {
    return db.collection('boards').find().toArray();
  },
  // Retrieve a board using its ID
  getById: async (boardId) => {
    return db.collection('boards').findOne({ _id: boardId });
  },
  // Create a new board in the database
  create: async (board) => {
    // First validate against the model
    const errors = boardModel.validate(board);
    // If no validation errors then create the board
    if (!errors.error) {
      await db.collection('boards').insertOne(board);
    } else {
      throw errors.error.details;
    }
  },
  // Remove a board from the database
  remove: async (boardId) => {
    return db.collection('boards').remove({ _id: boardId });
  }
};
