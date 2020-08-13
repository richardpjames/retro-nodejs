// For generating mongo object Ids
const { ObjectId } = require('mongodb');
// For broadcasting success to clients
const sockets = require('../sockets/socketio');
// Services required for managing data
const actionsService = require('../services/actionsService');
const teamsService = require('../services/teamsService');
const boardsService = require('../services/boardsService');
const usersService = require('../services/usersService');

// Get the socket server
const io = sockets.io();

module.exports = {
  // Get all simply returns all boards from the database
  getAll: async (req, res) => {
    const actions = await actionsService.query({
      boardId: ObjectId(req.params.boardId),
    });
    res.status(200);
    return res.send(actions);
  },
  getForUser: async (req, res) => {
    const teams = await teamsService.query({
      $or: [
        { members: { $elemMatch: { email: req.user.email } } },
        { userId: req.user.user_id },
      ],
    });
    const teamIds = teams.map((team) => team._id);
    const boards = await boardsService.query({
      $or: [{ userId: req.user.user_id }, { teamId: { $in: teamIds } }],
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
            return usersService
              .getById(update.userId, req.managementToken)
              .then((user) => {
                update.nickName = user.nickname;
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
      // Get the column from the request
      const action = req.body;
      // If not specified then default the status to open
      if (action.open === undefined) {
        action.open = true;
      }
      // Add additional data from url etc.
      action.boardId = ObjectId(req.params.boardId);
      action.created = Date.now();
      action.userId = req.user.user_id;
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
    await Promise.all(
      updatedAction.updates.map((update) => delete update.nickName),
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
