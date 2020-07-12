// We need to import express to create a router
const express = require('express');
// Next import the controllers that we need
const templatesController = require('../controllers/templatesController');
// This is for authentication
const authCheck = require('../auth/authCheck');
const permissionCheck = require('../auth/permissionCheck');

// Create a router
const templatesRouter = express.Router({ mergeParams: true });

// Secure all of these routes behind the auth check
templatesRouter.use(authCheck);
// Map all of the routes to controller actions
templatesRouter.get('/', templatesController.getAll);
// Get a specific template
templatesRouter.get('/:templateId', templatesController.get);
// This particular route needs a permissions check (only admins can amend templates)
templatesRouter.post(
  '/',
  permissionCheck('create:templates'),
  templatesController.create,
);

module.exports = templatesRouter;
