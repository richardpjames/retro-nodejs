// Import express to create our web server
const express = require('express');
const debug = require('debug')('app');

// Create the web server
const app = express();

// Create a hello world route
app.get('/', (req, res) => res.send('Hello World!'));

// Start the application on port 5000 or as per environment
const port = process.env.PORT || 5000;
app.listen(port, () =>
  debug(`Example app listening at http://localhost:${port}`),
);
