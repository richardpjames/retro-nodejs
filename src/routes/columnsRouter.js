// We need to import express to create a router
const express = require('express');
// Next import the controllers that we need
const columnsController = require('../controllers/columnsController');
// This is for authentication
const authCheck = require('../auth/authCheck');

// Create the router
const columnsRouter = express.Router({ mergeParams: true });

// Secure all of these routes behind the auth check
columnsRouter.use(authCheck);
// Routes
columnsRouter.get('/', columnsController.getAll);
columnsRouter.get('/:columnId', columnsController.get);

module.exports = columnsRouter;
