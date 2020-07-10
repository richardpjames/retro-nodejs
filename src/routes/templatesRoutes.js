// We need to import express to create a router
const express = require('express');
// Next import the controllers that we need
const templatesController = require('../controllers/templatesController');
// This is for authentication
const authCheck = require('../auth/authCheck');

// Create a router
const templatesRouter = express.Router();

// Secure all of these routes behind the auth check
templatesRouter.use(authCheck);
// Map all of the routes to controller actions
templatesRouter.get('/', templatesController.getAll);
templatesRouter.post('/', templatesController.create);

module.exports = templatesRouter;