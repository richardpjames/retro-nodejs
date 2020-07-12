// We need to import express to create a router
const express = require('express');
// Next import the controllers that we need
const templateColumnsController = require('../controllers/templateColumnsController');
// This is for authentication
const authCheck = require('../auth/authCheck');
const permissionCheck = require('../auth/permissionCheck');

// Create a router
const templateColumnsRouter = express.Router({ mergeParams: true });

// Secure all of these routes behind the auth check
templateColumnsRouter.use(authCheck);
// Map all of the routes to controller actions
templateColumnsRouter.get('/', templateColumnsController.getAll);
// This particular route needs a permissions check (only admins can amend templates)
templateColumnsRouter.post(
  '/',
  permissionCheck('create:templates'),
  templateColumnsController.create,
);

module.exports = templateColumnsRouter;
