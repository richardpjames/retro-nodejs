// Use the templatesService for datbase operations
const { ObjectId, ObjectID } = require('mongodb');
// For broadcasting success to clients
const sockets = require('../sockets/socketio');
// Services for data
const cardsService = require('../services/cardsService');
const votesService = require('../services/votesService');
const boardsService = require('../services/boardsService');
// For connection to the database
const postgres = require('../db/postgres');
// Get the connection pool
const pool = postgres.pool();

// Get the socket server
const io = sockets.io();

// The controller for dards
module.exports = {
  // Get all simply returns all cards from the database for a given board
  getAll: async (req, res) => {
    try {
      // Get the cards based on the board and column id
      const response = await pool.query(
        'SELECT c.*, u.userid, u.nickname FROM cards c LEFT JOIN columns c2 ON c.columnid = c2.columnid LEFT JOIN boards b ON c2.boardid = b.boardid LEFT JOIN users u ON c.userid = u.userid WHERE b.uuid = $1',
        [req.params.boardId],
      );
      // Get the cards from the response
      const cards = response.rows;
      res.status(200);
      return res.send(cards);
    } catch (error) {
      res.status(500);
      return res.send(error);
    }
  },
  // For the creation of new cards
  create: async (req, res) => {
    try {
      const check = await pool.query(
        'SELECT * FROM boards WHERE boardid = $1 AND locked = false',
        [req.params.boardId],
      );
      // Stop the creation of cards for locked boards
      if (check.rowCount === 0) {
        res.status(400);
        return res.send();
      }
      // Try and save the card (this will also validate the data)
      const response = await pool.query(
        'INSERT INTO cards (text, rank, colour, userid, columnid, created, updated) VALUES ($1, $2, $3, $4, $5, now(), now()) RETURNING *',
        [
          req.body.text,
          req.body.rank,
          req.body.colour,
          req.body.userid || req.user.userid,
          req.body.columnId,
        ],
      );
      const response2 = await pool.query(
        'SELECT c.*, u.nickname FROM cards c INNER JOIN users u ON c.userid = u.userid WHERE cardid = $1',
        [response.rows[0].cardid],
      );
      const [card] = response2.rows;
      res.status(200);
      io.to(req.params.boardId).emit('card created', card);
      return res.send(card);
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
  update: async (req, res) => {
    // Stop the updating of cards for locked boards
    const board = await boardsService.getById(req.params.boardId);
    if (board.locked) {
      res.status(400);
      return res.send();
    }
    // Find the new card sent in the request and the original as we need to compare
    const updatedCard = req.body;
    // Create an object ID from the user Id
    updatedCard.userId = ObjectID(req.body.userId);
    const originalCard = await cardsService.getById(req.params.cardId);

    // Changing the owner of the card is not allowed
    if (!originalCard.userId.equals(updatedCard.userId)) {
      res.status(400);
      return res.send();
    }
    // Changing the text of the card is not allowed unless you are the owner
    if (
      !originalCard.userId.equals(req.user._id) &&
      updatedCard.text !== originalCard.text
    ) {
      res.status(400);
      return res.send();
    }

    // If allowed uperation then convert strings to object ids
    updatedCard._id = ObjectID(updatedCard._id);
    updatedCard.columnId = ObjectID(updatedCard.columnId);
    updatedCard.boardId = ObjectID(updatedCard.boardId);
    try {
      // Update the card
      await cardsService.update(req.params.cardId, updatedCard);
      // After all affected cards are moved we can return the updated card
      res.status(200);
      io.to(req.params.boardId).emit('card updated', updatedCard);
      return res.send(updatedCard);
      // Return any errors back to the user
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
  remove: async (req, res) => {
    // Stop the removal of cards for locked boards
    const board = await boardsService.getById(req.params.boardId);
    if (board.locked) {
      res.status(400);
      return res.send();
    }
    const card = await cardsService.query({
      _id: ObjectId(req.params.cardId),
    });
    if (card.length === 0) {
      res.status(404);
      return res.send();
    }
    // Remove the requested card
    await cardsService.remove(req.params.cardId);
    // Remove any associated votes
    await votesService.removeQuery({ cardId: ObjectID(req.params.cardId) });
    // Shift all later cards down the list
    io.to(req.params.boardId).emit('card deleted', req.params.cardId);
    res.status(204);
    return res.send();
  },
};
