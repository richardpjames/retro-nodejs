// We need to import express to create a router
const express = require('express');
// Next import the controllers that we need
const teamsController = require('../controllers/teamsController');
// This is for authentication
const authCheck = require('../auth/authCheck');

// Create a router
const teamsRouter = express.Router({ mergeParams: true });

// Secure all of these routes behind the auth check
teamsRouter.use(authCheck);
// Map all of the routes to controller actions
teamsRouter.get('/', teamsController.getAll);
teamsRouter.get('/:teamId', teamsController.get);
teamsRouter.post('/', teamsController.create);
teamsRouter.put('/:teamId', teamsController.update);
teamsRouter.delete('/:teamId', teamsController.remove);
teamsRouter.put('/:teamId/memberships', teamsController.updateMembership);
teamsRouter.delete('/:teamId/memberships', teamsController.removeMembership);

module.exports = teamsRouter;
