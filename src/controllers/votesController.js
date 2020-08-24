// We just require the object id method from mongo and a connection to sockets
const sockets = require('../sockets/socketio');
// For connection to the database
const postgres = require('../db/postgres');

// Get the connection pool
const pool = postgres.pool();
// Get the socket server
const io = sockets.io();

module.exports = {
  getAll: async (req, res) => {
    try {
      // Get the data from the database
      const response = await pool.query(
        'SELECT v.*, u.nickname FROM votes v INNER JOIN cards c ON v.cardid = c.cardid INNER JOIN columns c2 ON c.columnid = c2.columnid INNER JOIN boards b ON c2.boardid = b.boardid INNER JOIN users u ON v.userid = u.userid WHERE b.uuid = $1',
        [req.params.boardid],
      );
      const votes = response.rows;
      res.status(200);
      return res.send(votes);
    } catch (error) {
      res.status(500);
      return res.send(error);
    }
  },
  // For the creation of new votes
  create: async (req, res) => {
    // Try and save the vote (this will also validate the data)
    try {
      const check = await pool.query(
        'SELECT * FROM boards WHERE boardid = $1 AND locked = false',
        [req.params.boardid],
      );
      // Stop the creation of votes for locked boards
      if (check.rowCount === 0) {
        res.status(400);
        return res.send();
      }
      // Insert the vote (constraints on the table prevents defaults)
      const response = await pool.query(
        'INSERT INTO votes (userid, cardid, created, updated) VALUES ($1, $2, now(), now()) RETURNING *',
        [req.body.userid, req.body.cardid],
      );
      const [vote] = response.rows;
      // Send the responses
      res.status(200);
      io.to(req.params.boardid).emit('vote created', vote);
      return res.send(vote);
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
  remove: async (req, res) => {
    try {
      const check = await pool.query(
        'SELECT * FROM boards WHERE boardid = $1 AND locked = false',
        [req.params.boardid],
      );
      // Stop the creation of votes for locked boards
      if (check.rowCount === 0) {
        res.status(400);
        return res.send();
      }
      const response = await pool.query(
        'DELETE FROM votes WHERE voteid = $1 and userid = $2',
        [req.params.voteid, req.user.userid],
      );
      // If nothing deleted
      if (response.rowCount === 0) {
        res.status(400);
        return res.send();
      }
      // Otherwise - send the responses
      io.to(req.params.boardid).emit('vote deleted', req.params.voteid);
      res.status(204);
      return res.send();
    } catch (error) {
      res.status(400);
      return res.send();
    }
  },
};
