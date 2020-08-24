// For generating mongo object Ids
const { ObjectId } = require('mongodb');
// For broadcasting success to clients
const sockets = require('../sockets/socketio');
// Services required for managing data
const actionsService = require('../services/actionsService');
const teamsService = require('../services/teamsService');
const boardsService = require('../services/boardsService');
const usersService = require('../services/usersService');

// For connection to the database
const postgres = require('../db/postgres');
// Get the connection pool
const pool = postgres.pool();

// Get the socket server
const io = sockets.io();

module.exports = {
  // Get all simply returns all boards from the database
  getAll: async (req, res) => {
    // Get all actions for the board
    const response = await pool.query(
      'SELECT a.* FROM actions a INNER JOIN boards b ON a.boardid = b.boardid WHERE b.uuid = $1',
      [req.params.boardid],
    );
    const actions = response.rows;
    res.status(200);
    return res.send(actions);
  },
  getForUser: async (req, res) => {
    const teams = await teamsService.query({
      $or: [
        { members: { $elemMatch: { email: req.user.email } } },
        { userid: req.user._id },
      ],
    });
    const teamids = teams.map((team) => team._id);
    const boards = await boardsService.query({
      $or: [{ userid: req.user._id }, { teamid: { $in: teamids } }],
    });
    const boardids = boards.map((board) => board._id);
    const actions = await actionsService.query({ boardid: { $in: boardids } });

    await Promise.all(
      actions.map(async (action) => {
        const _board = boards.find((b) => b._id.equals(action.boardid));
        if (_board) {
          action.boardName = _board.name;
          if (_board.teamid) {
            const _team = teams.find((t) => t._id.equals(_board.teamid));
            if (_team) {
              action.teamName = _team.name;
            }
          }
        }
        // Updates all of the updated within an action with the user information
        await Promise.all(
          action.updates.map((update) => {
            return usersService.getById(update.userid).then((user) => {
              update.nickname = user.nickname;
            });
          }),
        );
        return true;
      }),
    );
    res.status(200);
    return res.send(actions);
  },
  create: async (req, res) => {
    try {
      // Stop the creation of actions for locked boards
      const check = await pool.query(
        'SELECT * FROM boards WHERE boardid = $1 AND locked = false',
        [req.params.boardid],
      );
      // Stop the creation of cards for locked boards
      if (check.rowCount === 0) {
        res.status(400);
        return res.send();
      }
      // Try and save the card (this will also validate the data)
      const response = await pool.query(
        'INSERT INTO actions (text, owner, status, due, closed, userid, boardid, created, updated) VALUES ($1, $2, $3, $4, $5, $6, $7, now(), now()) RETURNING *',
        [
          req.body.text,
          req.body.owner,
          req.body.status,
          req.body.due,
          req.body.closed,
          req.user.userid,
          req.params.boardid,
        ],
      );
      const [action] = response.rows;
      // Check that the user owns this board
      res.status(200);
      io.to(req.params.boardid).emit('action created', action);
      return res.send(action);
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
  update: async (req, res) => {
    try {
      // Get the original action
      const check = await pool.query(
        'SELECT * FROM actions WHERE actionid = $1',
        [req.params.actionid],
      );
      // If it doesn't exist then return
      if (check.rowCount === 0) {
        res.status(400);
        return res.send();
      }
      const [originalAction] = check.rows;
      // Update the action
      const response = await pool.query(
        'UPDATE actions SET text = $1, owner = $2, status = $3, due = $4, closed = $5, updated = now() WHERE actionid = $6 RETURNING *',
        [
          req.body.text || originalAction.text,
          req.body.owner || originalAction.owner,
          req.body.status || originalAction.status,
          req.body.due || originalAction.due,
          req.body.closed || originalAction.closed,
        ],
      );
      const [updatedAction] = response.rows;
      // Send responses
      res.status(200);
      io.to(req.params.boardid).emit('action updated', updatedAction);
      return res.send(updatedAction);
      // Return any errors back to the user
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
  remove: async (req, res) => {
    // Remove the action
    const response = await pool.query(
      'DELETE FROM actions a WHERE a.actionid = $1 AND a.actionid IN (SELECT actionid FROM actions a INNER JOIN boards b ON a.boardid = b.boardid WHERE a.actionid = $1 AND b.locked = false)',
      [req.params.actionid],
    );
    // If nothing was removed
    if (response.rowCount === 0) {
      res.status(400);
      return res.send();
    }
    // Send responses
    io.to(req.params.boardid).emit('action deleted', req.params.actionid);
    res.status(204);
    return res.send();
  },
};
