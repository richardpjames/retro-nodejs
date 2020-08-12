// For generating mongo object Ids
const { ObjectID } = require('mongodb');

// Use the boardsService for datbase operations
const boardsService = require('../services/boardsService');
const templatesService = require('../services/templatesService');
const columnsService = require('../services/columnsService');
const templateColumnsService = require('../services/templateColumnsService');
const cardsService = require('../services/cardsService');
const teamsService = require('../services/teamsService');
const votesService = require('../services/votesService');

// Get the model to check the request
const createBoardModel = require('../models/createBoardModel');
const actionsService = require('../services/actionsService');

// The controller for boards
module.exports = {
  // Get all simply returns all boards from the database
  getAll: async (req, res) => {
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
    res.status(200);
    return res.send(boards);
  },
  // Get a single board from the ID in the params
  get: async (req, res) => {
    try {
      const board = await boardsService.getById(req.params.boardId);
      // If we can't find the board then send a 404
      if (!board) {
        res.status(404);
        res.send();
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
    const boardRequest = req.body;
    // Check that we have all required fields
    const errors = await createBoardModel.validate(boardRequest);
    // If there are any errors then return 400
    if (errors.error) {
      res.status(400);
      return res.send(errors.error);
    }
    // Get the template for the board
    const template = await templatesService.getById(boardRequest.templateId);
    const templateColumns = await templateColumnsService.query({
      templateId: ObjectID(boardRequest.templateId),
    });
    if (!template) {
      res.status(400);
      res.send('Template not found');
    }
    // Create the new board
    const board = { ...template };
    // Remove the copied ID
    // eslint-disable-next-line no-underscore-dangle
    delete board._id;
    // Set the board up from the request
    board.name = boardRequest.name;
    board.description = boardRequest.description;
    board.private = boardRequest.private;
    board.showActions = boardRequest.showActions;
    board.teamId = ObjectID(boardRequest.teamId);
    // Set the user for the board
    board.userId = req.user.user_id;
    // Set the created time
    board.created = Date.now();
    // Try and save the board (this will also validate the data)
    try {
      const result = await boardsService.create(board);
      // Now that the board is created we create the columns
      templateColumns.map(async (templateColumn) => {
        const column = { ...templateColumn };
        // Remove the uneeded ids
        // eslint-disable-next-line no-underscore-dangle
        delete column._id;
        delete column.templateId;
        // Add the created and the inserted id
        column.created = Date.now();
        column.boardId = result.insertedId;
        // Save this column and move onto the next
        await columnsService.create(column);
      });
      // If everything is inserted then return
      res.status(200);
      return res.send(board);
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
  remove: async (req, res) => {
    const board = await boardsService.getById(req.params.boardId);
    // Prevent users from deleting others boards
    if (!board || board.userId !== req.user.user_id) {
      res.status(404);
      return res.send();
    }
    // Remove the board and any columns, cards and votes
    await boardsService.remove(req.params.boardId);
    await columnsService.removeQuery({ boardId: ObjectID(req.params.boardId) });
    await cardsService.removeQuery({ boardId: ObjectID(req.params.boardId) });
    await votesService.removeQuery({ boardId: ObjectID(req.params.boardId) });
    await actionsService.removeQuery({ boardId: ObjectID(req.params.boardId) });
    res.status(204);
    return res.send();
  },
};
