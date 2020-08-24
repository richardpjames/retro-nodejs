// We need to import express to create a router
const express = require('express');
// Next import the controllers that we need
const votesController = require('../controllers/votesController');
// This is for authentication
const authCheck = require('../auth/authCheck');

// Create the router
const cardVotesRouter = express.Router({ mergeParams: true });

// Secure all of these routes behind the auth check
cardVotesRouter.use(authCheck);
// Routes
cardVotesRouter.post('/', votesController.create);
cardVotesRouter.delete('/:voteid', votesController.remove);

module.exports = cardVotesRouter;
