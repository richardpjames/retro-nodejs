// For generating uuids
const { v1: uuidv1 } = require('uuid');
// For broadcasting success to clients
const sockets = require('../sockets/socketio');
// For connection to the database
const postgres = require('../db/postgres');
// Get the connection pool
const pool = postgres.pool();

// Get the socket server
const io = sockets.io();

// The controller for boards
module.exports = {
  // Get all simply returns all boards from the database
  getAll: async (req, res) => {
    // Get all from the database
    const response = await pool.query(
      'SELECT DISTINCT b.* FROM boards b LEFT JOIN teams t ON b.teamid = t.teamid LEFT JOIN teammembers tm ON t.teamid = tm.teamid WHERE b.userid = $1 OR t.userid = $2 OR tm.email = $3',
      [req.user.userid, req.user.userid, req.user.email],
    );
    res.status(200);
    return res.send(response.rows);
  },
  // Get a single board from the ID in the params
  get: async (req, res) => {
    try {
      // Get from the database
      const response = await pool.query(
        'SELECT * FROM boards WHERE uuid = $1',
        [req.params.boardId],
      );
      // If we can't find the board then send a 404
      if (response.rowCount === 0) {
        res.status(404);
        res.send();
      }
      // Pull the board from the response
      const [board] = response.rows;
      // If the board is private then additional checks are needed
      if (board.private) {
        // Find which teams this user is in
        const response2 = await pool.query(
          'SELECT t.* FROM teams t LEFT JOIN teammembers tm ON t.teamid = t.teamid WHERE t.userid = $1 or tm.email = $2',
          [req.user.userid, req.user.email],
        );
        // Get the teams from the query result
        const teams = response2.rows;
        const teamIds = teams.map((team) => team.teamid);
        if (!teamIds.includes(board.teamid.toString())) {
          res.status(401);
          return res.send();
        }
      }
      res.status(200);
      return res.send(board);
      // If any errors, then catch and throw 500
    } catch (error) {
      res.status(500);
      return res.send(error);
    }
  },
  // For the creation of new boards
  create: async (req, res) => {
    const templateResponse = await pool.query(
      'SELECT * FROM templates WHERE templateid = $1',
      [req.body.templateId],
    );
    const templateColumnResponse = await pool.query(
      'SELECT * FROM templatecolumns WHERE templateid = $1',
      [req.body.templateId],
    );
    // Check that there was a template
    if (templateResponse.rowCount === 0) {
      res.status(400);
      res.send('Template not found');
    }
    // Pull the template from the response
    const [template] = templateResponse.rows;
    // Try and save the board (this will also validate the data)
    try {
      const uuid = uuidv1();
      const insertBoardReponse = await pool.query(
        'INSERT INTO boards (uuid, name, description, instructions, maxvotes, private, showactions, allowvotes, showinstructions, locked, userid, teamid, created, updated) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, now(), now()) RETURNING *',
        [
          uuid,
          req.body.name,
          req.body.description,
          template.instructions,
          template.maxvotes,
          req.body.private || false,
          req.body.showActions || false,
          req.body.allowVotes || false,
          req.body.showInstructions || false,
          req.body.locked || false,
          req.user.userid,
          req.body.teamId,
        ],
      );
      // Get the Id of the inserted board
      const boardId = insertBoardReponse.rows[0].boardid;
      // Now that the board is created we create the columns
      await Promise.all(
        templateColumnResponse.rows.map(async (column) => {
          await pool.query(
            'INSERT INTO columns (title, rank, boardid, created, updated) VALUES ($1, $2, $3, now(), now())',
            [column.title, column.rank, boardId],
          );
        }),
      );
      // If everything is inserted then return
      res.status(200);
      return res.send(insertBoardReponse.rows[0]);
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
  update: async (req, res) => {
    // Get the board from the database
    const response = await pool.query(
      'SELECT * FROM boards WHERE boardid = $ AND userid = $2 AND locked = false',
      [req.params.boardId, req.user.userid],
    );
    // Prevent users from updating others boards or updating locked boards
    if (response.rowCount === 0) {
      res.status(400);
      return res.send();
    }
    // Get the board from the response
    const [board] = response.rows;
    try {
      // Update the board
      const response2 = await pool.query(
        'UPDATE boards SET name = $1, description = $2, instructions = $3, maxvotes = $4, private = $5, showactions = $6, allowvotes = $7, showinstructions = $8, locked = $9, updated = now() WHERE boardid = $10 RETURNING *',
        [
          req.body.description || board.description,
          req.body.instructions || board.instructions,
          req.body.maxVotes || board.maxvotes,
          req.body.private || board.private,
          req.body.showActions || board.showactions,
          req.body.allowVotes || board.allowvotes,
          req.body.showInstructions || board.showinstructions,
          req.body.locked || board.locked,
          req.params.boardId,
        ],
      );
      const [updatedBoard] = response2.rows;
      // After all affected cards are moved we can return the updated card
      res.status(200);
      io.to(req.params.boardId).emit('board updated', updatedBoard);
      return res.send(updatedBoard);
      // Return any errors back to the user
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
  remove: async (req, res) => {
    // Delete the board (cascading deletes remove the rest)
    const response = await pool.query(
      'DELETE FROM boards WHERE uuid = $1 and userid = $2',
      [req.params.boardId, req.user.userid],
    );
    // If nothing was deleted
    if (response.rowCount === 0) {
      res.status(400);
      return res.send();
    }
    // Otherwise send an empty response
    res.status(204);
    return res.send();
  },
};
