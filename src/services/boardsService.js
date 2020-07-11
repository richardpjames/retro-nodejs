// For generating object Ids
const { ObjectId } = require('mongodb');
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
    return db.collection('boards').findOne({ _id: ObjectId(boardId) });
  },
  query: async (query) => {
    return db.collection('boards').find(query);
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
  // Replace a board with a new one
  update: async (boardId, board) => {
    // Validate the updated board against the model
    const errors = boardModel.validate(board);
    // If no validation errors then update the board
    if (!errors.error) {
      await db
        .collection('boards')
        .findOneAndUpdate({ _id: ObjectId(boardId) }, board);
    } else {
      throw errors.error.details;
    }
  },
  // Remove a board from the database
  remove: async (boardId) => {
    return db.collection('boards').remove({ _id: ObjectId(boardId) });
  },
};
