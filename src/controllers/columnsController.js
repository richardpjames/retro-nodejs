// Use the templatesService for datbase operations
const { ObjectId } = require('mongodb');
// Services for data
const columnsService = require('../services/columnsService');

// The controller for dards
module.exports = {
  // Get all simply returns all columns from the database for a given board
  getAll: async (req, res) => {
    const cards = await columnsService.query({
      boardId: ObjectId(req.params.boardId),
    });
    res.status(200);
    return res.send(cards);
  },
  get: async (req, res) => {
    try {
      const column = await columnsService.getById(req.params.columnId);
      // If we can't find the column then send a 404
      if (!column) {
        res.status(404);
        res.send();
      }
      res.status(200);
      return res.send(column);
      // If any errors, then catch and throw 500
    } catch (error) {
      res.status(500);
      return res.send(error);
    }
  },
};
