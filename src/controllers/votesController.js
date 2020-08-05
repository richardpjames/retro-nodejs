// We just require the object id method from mongo and a connection to sockets
const { ObjectId } = require('mongodb');
const sockets = require('../sockets/socketio');
// Required services for writing to the database
const votesService = require('../services/votesService');
const usersService = require('../services/usersService');
const boardsService = require('../services/boardsService');

// Get the socket server
const io = sockets.io();

module.exports = {
  getAll: async (req, res) => {
    try {
      // Build up the query
      let query = {};
      // If there is a boardId then add it
      if (req.params.boardId) {
        query = { ...query, boardId: ObjectId(req.params.boardId) };
      }
      const votes = await votesService.query(query);
      await Promise.all(
        votes.map(async (vote) => {
          // Add user information to the cards
          const user = await usersService.getById(
            vote.userId,
            req.managementToken,
          );
          // eslint-disable-next-line no-param-reassign
          vote.nickName = user.nickname;
          // eslint-disable-next-line no-param-reassign
          return vote;
        }),
      );
      res.status(200);
      return res.send(votes);
    } catch (error) {
      res.status(500);
      return res.send(error);
    }
  },
  // For the creation of new votes
  create: async (req, res) => {
    // Check if the user has already voted on this card
    const existingVote = await votesService.query({
      cardId: ObjectId(req.params.cardId),
      userId: req.user.user_id,
    });
    // reject if they have
    if (existingVote.length > 0) {
      res.status(400);
      return res.send();
    }

    // Check if there are too many votes for this board
    const board = await boardsService.getById(req.params.boardId);
    const totalVotes = await votesService.query({
      boardId: ObjectId(req.params.boardId),
      userId: req.user.user_id,
    });
    // Check the votes for this user against the max allowed for the board
    if (totalVotes.length >= board.maxVotes) {
      res.status(400);
      return res.send();
    }

    const vote = req.body;
    // Set the created time
    vote.created = Date.now();
    vote.userId = req.user.user_id;
    vote.boardId = ObjectId(req.params.boardId);
    vote.cardId = ObjectId(req.params.cardId);
    // Try and save the template (this will also validate the data)
    try {
      await votesService.create(vote);
      res.status(200);
      vote.nickName = req.user.nickname;
      io.to(req.params.boardId).emit('vote created', vote);
      return res.send(vote);
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
  remove: async (req, res) => {
    const vote = await votesService.query({
      _id: ObjectId(req.params.voteId),
      userId: req.user.user_id,
    });
    if (vote.length === 0) {
      res.status(404);
      return res.send();
    }
    // Remove the requested card
    await votesService.remove(req.params.voteId);
    // Shift all later cards down the list
    io.to(req.params.boardId).emit('vote deleted', req.params.voteId);
    res.status(204);
    return res.send();
  },
};
