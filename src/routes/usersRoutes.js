// We need to import express to create a router
const express = require('express');
// Next import the controllers that we need
const usersController = require('../controllers/usersController');

// Create a router
const usersRouter = express.Router();

// Map all of the routes to controller actions
usersRouter.get('/', usersController.getAll);
usersRouter.post('/', usersController.create);
usersRouter.delete('/:userId', usersController.remove);

module.exports = usersRouter;
