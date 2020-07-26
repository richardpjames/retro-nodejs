/* eslint global-require:0 */
// Import express to create our web server
const express = require('express');
// Http server
const http = require('http');
// For settings cors settings
const cors = require('cors');
// Body parser takes json objects from the body and adds them to the request
const bodyParser = require('body-parser');
// Debug allows the output of debug messages in development/production depending on environment variables
const debug = require('debug')('app');
// Load modules from inside the application
const config = require('./config/config');
// Database utlities
const mongo = require('./db/mongo');
const redis = require('./db/redis');
// Socket.io for realtime updates
const socketio = require('./sockets/socketio');
// Middleware for auth0
const auth0Token = require('./middleware/auth0Token');

// Connect to mongo and redis
mongo.connectToServer(() => {
  redis.connectToServer(() => {
    // Then create the web server
    const app = express();

    // Set up CORS settings
    app.use(cors());
    // Configuration and middleware
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    // Get the auth0 management token
    app.use(auth0Token);
    // Add express and socket.io to the http server
    const server = http.createServer(app);
    socketio.connectServer(server);

    // Routers are requried after we have connected to the db so allow require here
    const router = require('./routes/routes');
    app.use(router);

    // Start the application as per the configuration settings
    server.listen(config.application.port, () =>
      debug(`Server listening at http://localhost:${config.application.port}`),
    );
  });
});
