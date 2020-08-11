// Use the templatesService for datbase operations
const { ObjectId } = require('mongodb');
// For broadcasting success to clients
const sockets = require('../sockets/socketio');
// Services for data
const columnsService = require('../services/columnsService');
const boardsService = require('../services/boardsService');
const cardsService = require('../services/cardsService');

// Get the socket server
const io = sockets.io();

// The controller for dards
module.exports = {
  // Get all simply returns all columns from the database for a given board
  getAll: async (req, res) => {
    const cards = await columnsService.query({
      boardId: ObjectId(req.params.boardId),
    });
    res.status(200);
    return res.send(cards);
  },
  get: async (req, res) => {
    try {
      const column = await columnsService.getById(req.params.columnId);
      // If we can't find the column then send a 404
      if (!column) {
        res.status(404);
        res.send();
      }
      res.status(200);
      return res.send(column);
      // If any errors, then catch and throw 500
    } catch (error) {
      res.status(500);
      return res.send(error);
    }
  },
  create: async (req, res) => {
    try {
      // Get the column from the request
      const column = req.body;
      column.boardId = ObjectId(req.params.boardId);
      column.created = Date.now();
      // Check that the user owns this board
      const board = await boardsService.getById(req.params.boardId);
      // If the user does not own the board they cannot add a column
      if (board.userId !== req.user.user_id) {
        res.status(401);
        return res.send();
      }
      await columnsService.create(column);
      res.status(200);
      io.to(req.params.boardId).emit('column created', column);
      return res.send(column);
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
  update: async (req, res) => {
    // Find the new card sent in the request and the original as we need to compare
    const updatedColumn = req.body;
    const board = await boardsService.getById(req.params.boardId);
    // Check that there is a column for this board with the id
    const column = await columnsService.query({
      _id: ObjectId(req.params.columnId),
      boardId: ObjectId(req.params.boardId),
    });

    // Changing the column if you don't own the board is not okay
    if (!column || !board || board.userId !== req.user.user_id) {
      res.status(404);
      return res.send();
    }
    // If allowed uperation then convert strings to object ids
    updatedColumn.boardId = ObjectId(req.params.boardId);
    // Set the created date based on the existing
    updatedColumn.created = column[0].created;
    // Remove the exting id if present
    delete updatedColumn._id;
    try {
      // Update the card
      await columnsService.update(req.params.columnId, updatedColumn);
      // Set the Id for sending back
      updatedColumn._id = ObjectId(req.params.columnId);
      // After all affected cards are moved we can return the updated card
      res.status(200);
      io.to(req.params.boardId).emit('column updated', updatedColumn);
      return res.send(updatedColumn);
      // Return any errors back to the user
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
  remove: async (req, res) => {
    // Find the board to check ownership
    const board = await boardsService.getById(req.params.boardId);
    // Check that there is a column for this board with the id
    const column = await columnsService.query({
      _id: ObjectId(req.params.columnId),
      boardId: ObjectId(req.params.boardId),
    });
    // Prevent users from deleting others columns
    if (!column || !board || board.userId !== req.user.user_id) {
      res.status(404);
      return res.send();
    }
    // Remove the column and any cards
    await columnsService.remove(req.params.columnId);
    await cardsService.removeQuery({ columnId: ObjectId(req.params.columnId) });
    io.to(req.params.boardId).emit('column deleted', req.params.columnId);
    res.status(204);
    return res.send();
  },
};
