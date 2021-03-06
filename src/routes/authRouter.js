// We need to import express to create a router
const express = require('express');
// usersController for creating users etc.
const usersController = require('../controllers/usersController');
// This is for authentication
const authCheck = require('../auth/authCheck');

// Create the router
const authRouter = express.Router({ mergeParams: true });

// Routes
authRouter.post('/signup', usersController.create);
authRouter.post('/login', usersController.login);
authRouter.post('/forgotten', usersController.forgotten);
authRouter.post('/reset', usersController.reset);
authRouter.get('/logout', usersController.logout);
authRouter.get('/profile', authCheck, usersController.profile);
authRouter.get('/check', usersController.check);

module.exports = authRouter;
