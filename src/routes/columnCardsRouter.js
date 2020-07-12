// We need to import express to create a router
const express = require('express');
// Next import the controllers that we need
const cardsController = require('../controllers/cardsController');
// This is for authentication
const authCheck = require('../auth/authCheck');

// Create the router
const columnCardsRouter = express.Router({ mergeParams: true });

// Secure all of these routes behind the auth check
columnCardsRouter.use(authCheck);
// Routes
columnCardsRouter.get('/', cardsController.getAll);
columnCardsRouter.post('/', cardsController.create);
columnCardsRouter.put('/:cardId', cardsController.update);
columnCardsRouter.delete('/:cardId', cardsController.remove);

module.exports = columnCardsRouter;
