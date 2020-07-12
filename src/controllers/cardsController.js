// Use the templatesService for datbase operations
const { ObjectId, ObjectID } = require('mongodb');

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
  update: async (req, res) => {
    // Find the new card sent in the request and the original as we need to compare
    const updatedCard = req.body;
    const originalCard = await cardsService.getById(req.params.cardId);

    // Changing the owner of the card is not allowed
    if (updatedCard.userId !== originalCard.userId) {
      res.status(400);
      return res.send();
    }
    // Changing the text of the card is not allowed unless you are the owner
    if (
      originalCard.userId !== req.user.user_id &&
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

      // Check to see if the card has moved position (if so, we need to move
      // other cards around it as well).
      if (
        updatedCard.order !== originalCard.order ||
        !updatedCard.columnId.equals(originalCard.columnId)
      ) {
        let affectedCards = [];
        // If the card has only moved position, then this is easier
        if (updatedCard.columnId.equals(originalCard.columnId)) {
          // Find cards below the original position (they will be moved up by one)
          affectedCards = await cardsService.query({
            _id: { $ne: ObjectID(req.params.cardId) },
            columnId: updatedCard.columnId,
            order: { $gt: originalCard.order },
          });
          await Promise.all(
            affectedCards.map(async (affectedCard) => {
              affectedCard.order -= 1;
              await cardsService.update(affectedCard._id, affectedCard);
            }),
          );
          // Next we need to deal with cards above the new position (they will be moved down by one)
          affectedCards = await cardsService.query({
            _id: { $ne: ObjectID(req.params.cardId) },
            columnId: updatedCard.columnId,
            order: { $gte: updatedCard.order },
          });
          await Promise.all(
            affectedCards.map(async (affectedCard) => {
              affectedCard.order += 1;
              await cardsService.update(affectedCard._id, affectedCard);
            }),
          );
        }
        // Otherwise we need to move cards in the originating and new column
        else {
          // Move up the cards which are on the original column to fill in the gap
          affectedCards = await cardsService.query({
            _id: { $ne: ObjectID(req.params.cardId) },
            columnId: originalCard.columnId,
            order: { $gt: originalCard.order },
          });
          await Promise.all(
            affectedCards.map(async (affectedCard) => {
              affectedCard.order -= 1;
              await cardsService.update(affectedCard._id, affectedCard);
            }),
          );
          // Move down the cards in the new column to make a gap
          affectedCards = await cardsService.query({
            _id: { $ne: ObjectID(req.params.cardId) },
            columnId: updatedCard.columnId,
            order: { $gte: updatedCard.order },
          });
          await Promise.all(
            affectedCards.map(async (affectedCard) => {
              affectedCard.order += 1;
              await cardsService.update(affectedCard._id, affectedCard);
            }),
          );
        }
      }
      // After all affected cards are moved we can return the updated card
      res.status(200);
      return res.send(updatedCard);
      // Return any errors back to the user
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
