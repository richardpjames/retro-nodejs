// We need to import express to create a router
const express = require('express');
// Next import the controllers that we need
const actionsController = require('../controllers/actionsController');
// This is for authentication
const authCheck = require('../auth/authCheck');

// Create the router
const boardActionsRouter = express.Router({ mergeParams: true });

// Secure all of these routes behind the auth check
boardActionsRouter.use(authCheck);
// Routes
boardActionsRouter.get('/', actionsController.getAll);
boardActionsRouter.post('/', actionsController.create);
boardActionsRouter.delete('/:actionId', actionsController.remove);

module.exports = boardActionsRouter;
