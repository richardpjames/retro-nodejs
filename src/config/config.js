// This module contains configuration options for the application
module.exports = {
  application: {
    port: process.env.PORT || 5000,
    environment: process.env.NODE_ENV || 'production',
    baseUrl: process.env.BASE_URL || 'https://retrospectacle.io',
  },
  database: {
    connectionString: process.env.DATABASE_URL,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'https://retrospectacle.io',
  },
  keys: {
    mailgun: process.env.MAILGUN_API_KEY,
    ghost: process.env.GHOST_API_KEY,
  },
  sessions: {
    sessionSecret: process.env.SESSION_SECRET,
    cookieDomain: process.env.COOKIE_DOMAIN || 'retrospectacle.io',
    cookieSecure: process.env.COOKIE_SECURE,
  },
};
