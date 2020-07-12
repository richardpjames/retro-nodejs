// We need to import express to create a router
const express = require('express');
// Next import the controllers that we need
const cardsController = require('../controllers/cardsController');
// This is for authentication
const authCheck = require('../auth/authCheck');

// Create the router
const cardsRouter = express.Router({ mergeParams: true });

// Secure all of these routes behind the auth check
cardsRouter.use(authCheck);
// Routes
cardsRouter.get('/', cardsController.getAll);

module.exports = cardsRouter;
