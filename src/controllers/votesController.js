// We just require the object id method from mongo and a connection to sockets
const { ObjectId } = require('mongodb');
const sockets = require('../sockets/socketio');
// Required services for writing to the database
const votesService = require('../services/votesService');
const boardsService = require('../services/boardsService');
// For connection to the database
const postgres = require('../db/postgres');
// Get the connection pool
const pool = postgres.pool();

// Get the socket server
const io = sockets.io();

module.exports = {
  getAll: async (req, res) => {
    try {
      // Get the data from the database
      const response = await pool.query(
        'SELECT v.*, u.nickname FROM votes v INNER JOIN cards c ON v.cardid = c.cardid INNER JOIN columns c2 ON c.columnid = c2.columnid INNER JOIN boards b ON c2.boardid = b.boardid INNER JOIN users u ON v.userid = u.userid WHERE b.uuid = $1',
        [req.params.boardid],
      );
      const votes = response.rows;
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
      cardid: ObjectId(req.params.cardid),
      userid: req.user._id,
    });
    // reject if they have
    if (existingVote.length > 0) {
      res.status(400);
      return res.send();
    }

    // Check if there are too many votes for this board
    const board = await boardsService.getById(req.params.boardid);
    // Stop the creation of votes for locked boards
    if (board.locked) {
      res.status(400);
      return res.send();
    }
    const totalVotes = await votesService.query({
      boardid: ObjectId(req.params.boardid),
      userid: req.user._id,
    });
    // Check the votes for this user against the max allowed for the board
    if (totalVotes.length >= board.maxvotes) {
      res.status(400);
      return res.send();
    }

    const vote = req.body;
    // Set the created time
    vote.created = Date.now();
    vote.userid = req.user._id;
    vote.boardid = ObjectId(req.params.boardid);
    vote.cardid = ObjectId(req.params.cardid);
    // Try and save the template (this will also validate the data)
    try {
      await votesService.create(vote);
      res.status(200);
      vote.nickname = req.user.nickname;
      io.to(req.params.boardid).emit('vote created', vote);
      return res.send(vote);
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
  remove: async (req, res) => {
    const board = await boardsService.getById(req.params.boardid);
    // Stop the removal of votes for locked boards
    if (board.locked) {
      res.status(400);
      return res.send();
    }
    const vote = await votesService.query({
      _id: ObjectId(req.params.voteid),
      userid: req.user._id,
    });
    if (vote.length === 0) {
      res.status(404);
      return res.send();
    }
    // Remove the requested card
    await votesService.remove(req.params.voteid);
    // Shift all later cards down the list
    io.to(req.params.boardid).emit('vote deleted', req.params.voteid);
    res.status(204);
    return res.send();
  },
};
