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
const teamsRouter = require('./teamsRouter');
const votesRouter = require('./votesRouter');
const cardVotesRouter = require('./cardVotesRouter');
const boardActionsRouter = require('./boardActionsRouter');
const actionsRouter = require('./actionsRouter');
const sitemapController = require('../controllers/sitemapController');
const authRouter = require('./authRouter');

// Create a router
const router = express.Router({ mergeParams: true });

// Create our routes
router.use('/api/boards', boardsRouter);
router.use('/api/boards/:boardid/cards', cardsRouter);
router.use('/api/boards/:boardid/cards/:cardid/votes', cardVotesRouter);
router.use('/api/boards/:boardid/columns', columnsRouter);
router.use('/api/boards/:boardid/columns/:columnid/cards', columnCardsRouter);
router.use('/api/boards/:boardid/votes', votesRouter);
router.use('/api/boards/:boardid/actions', boardActionsRouter);
router.use('/api/templates', templatesRouter);
router.use('/api/templates/:templateid/columns', templateColumnsRouter);
router.use('/api/users', usersRouter);
router.use('/api/teams', teamsRouter);
router.use('/api/actions', actionsRouter);
router.use('/api/auth', authRouter);

// Add sitemap here as nowhere better to go
router.use('/sitemap', sitemapController.get);

module.exports = router;
