// Import express to create our web server
const express = require('express');
// Body parser takes json objects from the body and adds them to the request
const bodyParser = require('body-parser');
// Debug allows the output of debug messages in development/production depending on environment variables
const debug = require('debug')('app');

// Load modules from inside the application
const config = require('./config/config');
// Routers are requried
const boardRouter = require('./routes/boardRoutes');

// Create the web server
const app = express();
// Configuration and middleware
app.use(bodyParser.json());

// Create our routes
app.use('/api/boards', boardRouter);

// Start the application as per the configuration settings
app.listen(config.application.port, () =>
  debug(`Example app listening at http://localhost:${config.application.port}`),
);
