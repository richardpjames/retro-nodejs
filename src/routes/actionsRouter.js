// We need to import express to create a router
const express = require('express');
// Next import the controllers that we need
const actionsController = require('../controllers/actionsController');
// This is for authentication
const authCheck = require('../auth/authCheck');

// Create the router
const actionsRouter = express.Router({ mergeParams: true });

// Secure all of these routes behind the auth check
actionsRouter.use(authCheck);
// Routes
actionsRouter.get('/', actionsController.getForUser);
actionsRouter.get('/:actionid/updates', actionsController.getUpdates);
actionsRouter.post('/:actionid/updates', actionsController.addUpdate);
actionsRouter.delete(
  '/:actionid/updates/:updateid',
  actionsController.removeUpdate,
);

module.exports = actionsRouter;
