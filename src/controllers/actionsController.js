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
      [req.params.boardId],
    );
    const actions = response.rows;
    res.status(200);
    return res.send(actions);
  },
  getForUser: async (req, res) => {
    const teams = await teamsService.query({
      $or: [
        { members: { $elemMatch: { email: req.user.email } } },
        { userId: req.user._id },
      ],
    });
    const teamIds = teams.map((team) => team._id);
    const boards = await boardsService.query({
      $or: [{ userId: req.user._id }, { teamId: { $in: teamIds } }],
    });
    const boardIds = boards.map((board) => board._id);
    const actions = await actionsService.query({ boardId: { $in: boardIds } });

    await Promise.all(
      actions.map(async (action) => {
        const _board = boards.find((b) => b._id.equals(action.boardId));
        if (_board) {
          action.boardName = _board.name;
          if (_board.teamId) {
            const _team = teams.find((t) => t._id.equals(_board.teamId));
            if (_team) {
              action.teamName = _team.name;
            }
          }
        }
        // Updates all of the updated within an action with the user information
        await Promise.all(
          action.updates.map((update) => {
            return usersService.getById(update.userId).then((user) => {
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
    const board = await boardsService.getById(req.params.boardId);
    // Stop the creation of actions for locked boards
    if (board.locked) {
      res.status(400);
      return res.send();
    }
    try {
      // Get the column from the request
      const action = req.body;
      // If not specified then default the status to to do
      if (action.status === undefined) {
        action.status = 'todo';
      }
      // Add additional data from url etc.
      action.boardId = ObjectId(req.params.boardId);
      action.created = Date.now();
      action.userId = req.user._id;
      // Check that the user owns this board
      await actionsService.create(action);
      res.status(200);
      io.to(req.params.boardId).emit('action created', action);
      return res.send(action);
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
  update: async (req, res) => {
    // Find the new action sent in the request and the original as we need to compare
    const updatedAction = req.body;
    delete updatedAction._id;
    updatedAction.userId = ObjectId(req.body.userId);
    await Promise.all(
      updatedAction.updates.map((update) => delete update.nickname),
    );
    // If allowed uperation then convert strings to object ids
    updatedAction.boardId = ObjectId(updatedAction.boardId);
    try {
      // Update the card
      await actionsService.update(req.params.actionId, updatedAction);
      // After all affected cards are moved we can return the updated card
      res.status(200);
      io.to(req.params.boardId).emit('action updated', updatedAction);
      return res.send(updatedAction);
      // Return any errors back to the user
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
  remove: async (req, res) => {
    const board = await boardsService.getById(req.params.boardId);
    // Stop the removal of actions for locked boards
    if (board.locked) {
      res.status(400);
      return res.send();
    }
    // Check that there is a column for this board with the id
    const action = await actionsService.query({
      _id: ObjectId(req.params.actionId),
      boardId: ObjectId(req.params.boardId),
    });
    // Prevent users from deleting others columns
    if (!action) {
      res.status(404);
      return res.send();
    }
    // Remove the action
    await actionsService.remove(req.params.actionId);
    io.to(req.params.boardId).emit('action deleted', req.params.actionId);
    res.status(204);
    return res.send();
  },
};
