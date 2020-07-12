// Use the templatesService for datbase operations
const { ObjectId } = require('mongodb');

// Services for data
const cardsService = require('../services/cardsService');
const usersService = require('../services/usersService');

// The controller for dards
module.exports = {
  // Get all simply returns all cards from the database for a given board
  getAll: async (req, res) => {
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
        const user = await usersService.getById(card.userId);
        // eslint-disable-next-line no-param-reassign
        card.nickName = user.nickname;
        // eslint-disable-next-line no-param-reassign
        card.picture = user.picture;
        return card;
      }),
    );
    res.status(200);
    return res.send(cards);
  },
  // For the creation of new cards
  create: async (req, res) => {
    const card = req.body;
    // Find the existing cards for this column
    const cards = await cardsService.query({
      columnId: ObjectId(req.params.columnId),
    });
    // Set the created time
    card.created = Date.now();
    card.userId = req.user.user_id;
    card.order = cards.length;
    card.boardId = ObjectId(req.params.boardId);
    card.columnId = ObjectId(req.params.columnId);
    // Try and save the template (this will also validate the data)
    try {
      await cardsService.create(card);
      res.status(200);
      card.nickName = req.user.nickname;
      card.picture = req.user.picture;
      return res.send(card);
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
  remove: async (req, res) => {
    const card = await cardsService.getById(req.params.cardId);
    if (!card) {
      res.status(404);
      res.send();
    }
    const cardsToMove = await cardsService.query({
      columnId: ObjectId(card.columnId),
      order: { $gt: card.order },
    });
    // Remove the requested card
    await cardsService.remove(req.params.cardId);
    // Shift all later cards down the list
    await Promise.all(
      cardsToMove.map(async (cardToMove) => {
        cardToMove.order -= 1;
        await cardsService.update(cardToMove._id, cardToMove);
      }),
    );
    res.status(204);
    return res.send();
  },
};
