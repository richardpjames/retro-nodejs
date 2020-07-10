// Import express to create our web server
const express = require('express');
// Body parser takes json objects from the body and adds them to the request
const bodyParser = require('body-parser');
// Debug allows the output of debug messages in development/production depending on environment variables
const debug = require('debug')('app');
// Load modules from inside the application
const config = require('./config/config');
// Database utlities
const mongo = require('./db/mongo');

mongo.connectToServer(() => {
  // Then create the web server
  const app = express();
  // Configuration and middleware
  app.use(bodyParser.json());

  // Routers are requried after we have connected to the db so allow require here
  // eslint-disable-next-line global-require
  const boardsRouter = require('./routes/boardsRoutes');

  // Create our routes
  app.use('/api/boards', boardsRouter);

  // Start the application as per the configuration settings
  app.listen(config.application.port, () =>
    debug(`Server listening at http://localhost:${config.application.port}`),
  );
});
