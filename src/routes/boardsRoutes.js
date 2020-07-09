// We need to import express to create a router
const express = require('express');
// Next import the controllers that we need
const boardsController = require('../controllers/boardsController');
// This is for authentication
const authCheck = require('../auth/authCheck');

// Create a router
const boardsRouter = express.Router();

// Secure all of these routes behind the auth check
boardsRouter.use(authCheck);
// Map all of the routes to controller actions
boardsRouter.get('/', boardsController.getAll);

module.exports = boardsRouter;
