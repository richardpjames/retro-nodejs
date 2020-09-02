// We need to import express to create a router
const express = require('express');
// Next import the controllers that we need
const membersController = require('../controllers/membersController');
// This is for authentication
const authCheck = require('../auth/authCheck');

// Create a router
const membersRouter = express.Router({ mergeParams: true });

// Secure all of these routes behind the auth check
membersRouter.use(authCheck);
// Map all of the routes to controller actions
membersRouter.get('/', membersController.getAll);
membersRouter.get('/:memberid', membersController.get);
membersRouter.post('/', membersController.create);
membersRouter.put('/:memberid', membersController.update);
membersRouter.delete('/:memberid', membersController.remove);

module.exports = membersRouter;
