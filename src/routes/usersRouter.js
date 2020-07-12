// We need to import express to create a router
const express = require('express');
// Next import the controllers that we need
const usersController = require('../controllers/usersController');
const authCheck = require('../auth/authCheck');

// Create a router
const usersRouter = express.Router({ mergeParams: true });

// Only allow for authenticated users
usersRouter.use(authCheck);
// Map all of the routes to controller actions
usersRouter.get('/', usersController.getAll);
usersRouter.get('/:userId', usersController.getById);

module.exports = usersRouter;
