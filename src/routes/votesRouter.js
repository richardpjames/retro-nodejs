// We need to import express to create a router
const express = require('express');
// Next import the controllers that we need
const votesController = require('../controllers/votesController');
// This is for authentication
const authCheck = require('../auth/authCheck');

// Create the router
const votesRouter = express.Router({ mergeParams: true });

// Secure all of these routes behind the auth check
votesRouter.use(authCheck);
// Routes
votesRouter.use('/', votesController.getAll);

module.exports = votesRouter;
