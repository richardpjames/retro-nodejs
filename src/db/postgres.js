// Get required components from postgres
const { Pool } = require('pg');
// Get configuration
const config = require('../config/config');

// Need to be able to access the pool at any time
let pool;

const postgres = {
  connectToServer: () => {
    pool = new Pool({
      connectionString: config.database.connectionString,
      ssl: {
        required: true,
        rejectUnauthorized: false,
      },
    });
  },
  pool: () => {
    return pool;
  },
};

module.exports = postgres;
