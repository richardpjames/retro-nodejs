// Use the boardsService for datbase operations
const boardsService = require('../services/boardsService');

// The controller for boards
module.exports = {
  // Get all simply returns all boards from the database
  getAll: async (req, res) => {
    const boards = await boardsService.getAll();
    res.status(200);
    return res.send(boards);
  },
  // For the creation of new boards
  create: async (req, res) => {
    const board = req.body;
    // Set the user for the board
    board.user = req.user.sub;
    // Set the created time
    board.created = Date.now();
    // Try and save the board (this will also validate the data)
    try {
      await boardsService.create(board);
      res.status(200);
      return res.send();
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
};
