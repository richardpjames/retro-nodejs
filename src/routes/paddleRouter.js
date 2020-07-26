// We need to import express to create a router
const express = require('express');
// Next import the controllers that we need
const paddleController = require('../controllers/paddleController');

// Create a router
const paddleRouter = express.Router({ mergeParams: true });

// Map all of the routes to controller actions
paddleRouter.post('/', paddleController.post);

module.exports = paddleRouter;
