// For connection to the database
const postgres = require('../db/postgres');
// For broadcasting success to clients
const sockets = require('../sockets/socketio');

// Get the socket server
const io = sockets.io();
// Get the connection pool
const pool = postgres.pool();

// The controller for dards
module.exports = {
  // Get all simply returns all columns from the database for a given board
  getAll: async (req, res) => {
    const response = await pool.query(
      'SELECT c.* FROM columns c INNER JOIN boards b ON c.boardid = b.boardid WHERE b.uuid = $1',
      [req.params.boardid],
    );
    const columns = response.rows;
    res.status(200);
    return res.send(columns);
  },
  get: async (req, res) => {
    try {
      // Find the column
      const response = await pool.query(
        'SELECT * FROM columns WHERE columnid = $1',
        [req.params.columnid],
      );
      // If nothing found then 404
      if (response.rowCount === 0) {
        res.status(404);
        return res.send();
      }
      const [column] = response.rows;
      // Send the column
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
      // Check the user owns this board
      const checkResponse = await pool.query(
        'SELECT * FROM boards WHERE boardid = $1 AND userid = $2 AND locked = false',
        [req.params.boardid, req.user.userid],
      );
      // If there is no board (or it was locked)
      if (checkResponse.rowCount === 0) {
        res.status(400);
        return res.send();
      }
      // Insert the column
      const response = await pool.query(
        'INSERT INTO columns (title, rank, boardid, created, updated) values ($1, $2, $3, now(), now()) RETURNING *',
        [req.body.title, req.body.rank, req.params.boardid],
      );
      const [column] = response.rows;
      res.status(200);
      io.to(req.params.boardid).emit('column created', column);
      return res.send(column);
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
  update: async (req, res) => {
    try {
      const response = await pool.query(
        'UPDATE columns c SET title = $1, rank = $2, updated = now() FROM boards b WHERE b.boardid = c.boardid AND c.columnid = $3 AND b.locked = false AND b.boardid = $4 AND b.userid = $5 RETURNING c.*',
        [
          req.body.title,
          req.body.rank,
          req.params.columnid,
          req.params.boardid,
          req.user.userid,
        ],
      );
      // If nothing was update then send an error
      if (response.rowCount === 0) {
        res.status(400);
        return res.send();
      }
      // Find the new card sent in the request and the original as we need to compare
      const [updatedColumn] = response.rows;
      // After all affected cards are moved we can return the updated card
      res.status(200);
      io.to(req.params.boardid).emit('column updated', updatedColumn);
      return res.send(updatedColumn);
      // Return any errors back to the user
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
  remove: async (req, res) => {
    // Check the user owns this board
    const checkResponse = pool.query(
      'SELECT * FROM boards WHERE boardid = $1 AND userid = $2 AND locked = false',
      [req.params.boardid, req.user.userid],
    );
    // If there is no board (or it was locked)
    if (checkResponse.rowCount === 0) {
      res.status(400);
      return res.send();
    }
    // Remove the column (other tables cascade)
    await pool.query(
      'DELETE FROM columns WHERE columnid = $1 and boardid = $2',
      [req.params.columnid, req.params.boardid],
    );
    io.to(req.params.boardid).emit('column deleted', req.params.columnid);
    res.status(204);
    return res.send();
  },
};
