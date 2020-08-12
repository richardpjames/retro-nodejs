// For generating mongo object Ids
const { ObjectId } = require('mongodb');
// For broadcasting success to clients
const sockets = require('../sockets/socketio');
// Services required for managing data
const actionsService = require('../services/actionsService');

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
