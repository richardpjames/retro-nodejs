// We need to import express to create a router
const express = require('express');
// Next import the controllers that we need
const boardsController = require('../controllers/boardsController');
// This is for authentication
const authCheck = require('../auth/authCheck');

// Create a router
const boardRouter = express.Router();

// Secure all of these routes behind the auth check
boardRouter.use(authCheck);
// Map all of the routes to controller actions
boardRouter.get('/', boardsController.getAll);

module.exports = boardRouter;
