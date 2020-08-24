// For broadcasting success to clients
const sockets = require('../sockets/socketio');
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
          req.body.columnid,
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
    try {
      // Get the original card to ensure it's not on a locked board
      const check = await pool.query(
        'SELECT * FROM cards c INNER JOIN columns c2 ON c.columnid = c2.columnid INNER JOIN boards b ON c2.boardid = b.boardid WHERE cardid = $1 AND b.locked = false',
        [req.params.cardId],
      );
      // If no rows returned
      if (check.rowCount === 0) {
        res.status(400);
        return res.send();
      }
      const [originalCard] = check.rows;
      // Changing the text of the card is not allowed unless you are the owner
      if (
        !originalCard.userid === req.user.userid &&
        req.body.text !== originalCard.text
      ) {
        res.status(400);
        return res.send();
      }
      // Update the card
      const response = await pool.query(
        'UPDATE cards SET text = $1, rank = $2, colour = $3, columnid = $4, updated = now() WHERE cardid = $5 RETURNING *',
        [
          req.body.text || originalCard.text,
          req.body.rank || originalCard.rank,
          req.body.colour || originalCard.colour,
          req.body.columnid || originalCard.columnid,
          req.params.cardId,
        ],
      );
      const [updatedCard] = response.rows;
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
    try {
      const response = await pool.query(
        'DELETE FROM cards c WHERE c.cardid = $1 AND c.cardid IN (SELECT cardid FROM cards c INNER JOIN columns c2 ON c.columnid = c2.columnid INNER JOIN boards b ON c2.boardid = b.boardid WHERE c.cardid = $1 AND b.locked = false)',
        [req.params.cardId],
      );
      // If nothing was removed
      if (response.rowCount === 0) {
        res.status(400);
        return res.send();
      }
      // Send responses
      io.to(req.params.boardId).emit('card deleted', req.params.cardId);
      res.status(204);
      return res.send();
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
};
