// We need express to create the router
const express = require('express');

// Routers for each entity
const boardsRouter = require('./boardsRouter');
const cardsRouter = require('./cardsRouter');
const columnsRouter = require('./columnsRouter');
const columnCardsRouter = require('./columnCardsRouter');
const templatesRouter = require('./templatesRouter');
const usersRouter = require('./usersRouter');
const templateColumnsRouter = require('./templateColumnsRouter');

// Create a router
const router = express.Router({ mergeParams: true });

// Create our routes
router.use('/api/boards', boardsRouter);
router.use('/api/boards/:boardId/cards', cardsRouter);
router.use('/api/boards/:boardId/columns', columnsRouter);
router.use('/api/boards/:boardId/columns/:columnId/cards', columnCardsRouter);
router.use('/api/templates', templatesRouter);
router.use('/api/templates/:templateId/columns', templateColumnsRouter);
router.use('/api/users', usersRouter);

module.exports = router;
