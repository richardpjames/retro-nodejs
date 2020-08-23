// This module contains configuration options for the application
module.exports = {
  application: {
    port: process.env.PORT || 5000,
    environment: process.env.NODE_ENV || 'production',
    baseUrl: process.env.BASE_URL || 'https://retrospectacle.io',
  },
  database: {
    url: process.env.MONGO_URL || 'mongodb://localhost:27017',
    connectionString: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'https://retrospectacle.io',
  },
  keys: {
    mailgun: process.env.MAILGUN_API_KEY,
    ghost: process.env.GHOST_API_KEY,
  },
};
