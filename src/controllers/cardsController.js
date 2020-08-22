// Use the templatesService for datbase operations
const { ObjectId, ObjectID } = require('mongodb');
// For broadcasting success to clients
const sockets = require('../sockets/socketio');
// Services for data
const cardsService = require('../services/cardsService');
const usersService = require('../services/usersService');
const votesService = require('../services/votesService');
const boardsService = require('../services/boardsService');

// Get the socket server
const io = sockets.io();

// The controller for dards
module.exports = {
  // Get all simply returns all cards from the database for a given board
  getAll: async (req, res) => {
    try {
      // Build up the query
      let query = {};
      // If there is a boardId then add it
      if (req.params.boardId) {
        query = { ...query, boardId: ObjectId(req.params.boardId) };
      }
      // If there is a columnId then add it
      if (req.params.columnId) {
        query = { ...query, columnId: ObjectId(req.params.columnId) };
      }
      const cards = await cardsService.query(query);
      await Promise.all(
        cards.map(async (card) => {
          // Add user information to the cards
          const user = await usersService.getById(
            card.userId,
            req.managementToken,
          );
          // eslint-disable-next-line no-param-reassign
          card.nickName = user.nickname;
          // eslint-disable-next-line no-param-reassign
          card.picture = user.picture;
          return card;
        }),
      );
      res.status(200);
      return res.send(cards);
    } catch (error) {
      res.status(500);
      return res.send(error);
    }
  },
  // For the creation of new cards
  create: async (req, res) => {
    // Stop the creation of cards for locked boards
    const board = await boardsService.getById(req.params.boardId);
    if (board.locked) {
      res.status(400);
      return res.send();
    }
    const card = req.body;
    // Set the created time
    card.created = Date.now();
    if (!card.userId) {
      card.userId = req.user._id;
    } else {
      card.userId = ObjectId(card.userId);
    }
    card.boardId = ObjectId(req.params.boardId);
    card.columnId = ObjectId(req.params.columnId);
    // Try and save the template (this will also validate the data)
    try {
      await cardsService.create(card);
      res.status(200);
      const user = await usersService.getById(card.userId);
      card.nickName = user.nickname;
      card.picture = req.user.picture;
      io.to(req.params.boardId).emit('card created', card);
      return res.send(card);
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
  update: async (req, res) => {
    // Stop the updating of cards for locked boards
    const board = await boardsService.getById(req.params.boardId);
    if (board.locked) {
      res.status(400);
      return res.send();
    }
    // Find the new card sent in the request and the original as we need to compare
    const updatedCard = req.body;
    // Create an object ID from the user Id
    updatedCard.userId = ObjectID(req.body.userId);
    const originalCard = await cardsService.getById(req.params.cardId);

    // Changing the owner of the card is not allowed
    if (!originalCard.userId.equals(updatedCard.userId)) {
      res.status(400);
      return res.send();
    }
    // Changing the text of the card is not allowed unless you are the owner
    if (
      !originalCard.userId.equals(req.user._id) &&
      updatedCard.text !== originalCard.text
    ) {
      res.status(400);
      return res.send();
    }

    // If allowed uperation then convert strings to object ids
    updatedCard._id = ObjectID(updatedCard._id);
    updatedCard.columnId = ObjectID(updatedCard.columnId);
    updatedCard.boardId = ObjectID(updatedCard.boardId);
    try {
      // Update the card
      await cardsService.update(req.params.cardId, updatedCard);
      // After all affected cards are moved we can return the updated card
      res.status(200);
      io.to(req.params.boardId).emit('card updated', updatedCard);
      return res.send(updatedCard);
      // Return any errors back to the user
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
  remove: async (req, res) => {
    // Stop the removal of cards for locked boards
    const board = await boardsService.getById(req.params.boardId);
    if (board.locked) {
      res.status(400);
      return res.send();
    }
    const card = await cardsService.query({
      _id: ObjectId(req.params.cardId),
    });
    if (card.length === 0) {
      res.status(404);
      return res.send();
    }
    // Remove the requested card
    await cardsService.remove(req.params.cardId);
    // Remove any associated votes
    await votesService.removeQuery({ cardId: ObjectID(req.params.cardId) });
    // Shift all later cards down the list
    io.to(req.params.boardId).emit('card deleted', req.params.cardId);
    res.status(204);
    return res.send();
  },
};
