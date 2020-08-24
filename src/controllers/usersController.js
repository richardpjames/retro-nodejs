// Jwt for authorisation
const jwt = require('jsonwebtoken');
// For hasing passwords
const bcrypt = require('bcrypt');
// For refresh tokens
const { v1: uuidv1 } = require('uuid');
// Mailgun for emails
const mailgun = require('mailgun-js');
// For requesting IP info
const axios = require('axios');
// md5 for gravatar
const md5 = require('md5');
// For generating tokens
const randomstring = require('randomstring');
// Get configuration
const config = require('../config/config');
// Get the pool for the database
const postgres = require('../db/postgres');
// Get the pool for the database
const pool = postgres.pool();

// The controller for users
module.exports = {
  // For getting all users
  getAll: async (req, res) => {
    // Get all users
    const result = await pool.query(
      'SELECT userid, nickname, email FROM users',
    );
    // If no users returned then send 404
    if (result.rowCount === 0) {
      res.status(404);
      return res.send();
    }
    // If we have users then don't expose anything untoward, just the id,  nicknames and pictures
    const returnedUsers = [];
    await Promise.all(
      result.rows.map((user) => {
        const md5email = md5(user.email.trim().toLowerCase());
        returnedUsers.push({
          userid: user.userid,
          nickname: user.nickname,
          picture: `https://www.gravatar.com/avatar/${md5email}?s=256`,
        });
        return true;
      }),
    );
    res.status(200);
    return res.send(returnedUsers);
  },
  // For getting a single user
  getById: async (req, res) => {
    const result = await pool.query(
      'SELECT userid, nickname, email FROM users WHERE userid = $1',
      [req.params.userid],
    );
    if (result.rowCount === 0) {
      res.status(404);
      return res.send();
    }
    // Get the row from the result
    const [user] = result.rows;
    const md5email = md5(user.email.trim().toLowerCase());
    const returnedUser = {
      userid: user.userid,
      nickname: user.nickname,
      picture: `https://www.gravatar.com/avatar/${md5email}?s=256`,
    };
    res.status(200);
    return res.send(returnedUser);
  },
  create: async (req, res) => {
    try {
      // Hash the password
      req.body.password = await bcrypt.hash(req.body.password, 10);
      // Save the information provided by the user to the the database
      const result = await pool.query(
        'INSERT INTO users (email, nickname, password, created, updated) VALUES (lower($1), $2, $3, now(), now()) RETURNING userid, email, nickname',
        [req.body.email, req.body.nickname, req.body.password],
      );
      // Send back the created user
      return res.send(result.rows[0]);
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
  update: async (req, res) => {
    try {
      // Get the user from the database
      const result = await pool.query('SELECT * FROM users WHERE userid = $1', [
        req.params.userid,
      ]);
      // If no user then return an error
      if (result.rowCount === 0) {
        res.status(400);
        return res.send();
      }
      // Get the user from the query
      const [user] = result.rows;
      // Check that the user is the current user and check their password
      const passwordCheck = await bcrypt.compare(
        req.body.password,
        user.password,
      );
      // If the password is incorrect or this isn't the current user
      if (!passwordCheck || !req.user.userid === req.params.userid) {
        res.status(400);
        return res.send();
      }
      // If there is a new password then replace the old
      if (req.body.newPassword) {
        req.body.password = await bcrypt.hash(req.body.newPassword, 10);
      } else {
        // Remove the password if not being updated
        delete req.body.password;
      }
      // Update the user, falling back on any previous values
      const result2 = await pool.query(
        'UPDATE users SET nickname = $1, password = $2, updated = now() WHERE userid = $3 RETURNING userid, email, nickname',
        [
          req.body.nickname || user.nickname,
          req.body.password || user.password,
          req.params.userid,
        ],
      );
      return res.send(result2.rows[0]);
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
  login: async (req, res) => {
    try {
      // Get the user from the database
      const result = await pool.query(
        'SELECT * FROM users WHERE lower(email) = lower($1)',
        [req.body.email],
      );
      // If there is no user with that email
      if (result.rowCount === 0) {
        res.status(401);
        return res.send();
      }
      // Get the user from the query
      const [user] = result.rows;
      // If there is a user then check the password
      const passwordCheck = await bcrypt.compare(
        req.body.password,
        user.password,
      );
      // If there is an issue with the password
      if (!passwordCheck) {
        res.status(401);
        return res.send();
      }
      // Otherwise send the user details in the token body
      const body = {
        userid: user.userid,
      };
      // Sign the JWT token and populate the payload with the user email and id
      const token = jwt.sign({ user: body }, config.jwt.secret, {
        expiresIn: '24h',
      });
      // Generate a refresh token
      const refreshString = uuidv1();
      // Create a refreshtoken with the user and token
      const refreshToken = jwt.sign(
        { user: body, token: refreshString },
        config.jwt.refreshSecret,
        {
          expiresIn: '1y',
        },
      );
      // Get geographic information from IPINFO
      const { data } = await axios.get(
        `https://ipinfo.io/${req.ip}?token=${config.keys.ipinfo}`,
      );
      // Write to the database
      await pool.query(
        'INSERT INTO tokens (userid, token, description) VALUES ($1, $2, $3)',
        [
          user.userid,
          refreshString,
          `${data.city} - ${data.region} - ${req.headers['user-agent']}`,
        ],
      );
      // Send back the token to the user
      res.status(200);
      if (config.application.environment === 'development') {
        res.cookie('token', token, {
          maxAge: 24 * 60 * 60 * 1000,
          domain: 'localhost',
          secure: false,
          httpOnly: true,
        });
        res.cookie('refreshToken', refreshToken, {
          maxAge: 365 * 24 * 60 * 60 * 1000,
          domain: 'localhost',
          path: '/api/auth/',
          secure: false,
          httpOnly: true,
        });
        res.cookie('isAuthenticated', true, {
          maxAge: 365 * 24 * 60 * 60 * 1000,
          domain: 'localhost',
        });
      } else {
        res.cookie('token', token, {
          maxAge: 24 * 60 * 60 * 1000,
          domain: 'retrospectacle.io',
          secure: true,
          httpOnly: true,
        });
        res.cookie('refreshToken', refreshToken, {
          maxAge: 365 * 24 * 60 * 60 * 1000,
          domain: 'retrospectacle.io',
          path: '/api/auth/refresh',
          secure: true,
          httpOnly: true,
        });
        res.cookie('isAuthenticated', true, {
          maxAge: 365 * 24 * 60 * 60 * 1000,
          domain: 'retrospectacle.io',
        });
      }
      return res.send();
    } catch (error) {
      res.status(401);
      return res.send(error);
    }
  },
  refresh: async (req, res) => {
    // For storing the token
    const { refreshToken } = req.cookies;
    try {
      // Verify the token
      const verified = jwt.verify(refreshToken, config.jwt.refreshSecret);
      // Add the user to the request
      const result = await pool.query(
        'SELECT * FROM tokens WHERE token = $1 AND userid = $2',
        [verified.token, verified.user.userid],
      );
      // If we couldn't find the token (invalidated)
      if (result.rowCount === 0) {
        res.status(401);
        return res.send();
      }
      // Otherwise send a new access token
      const body = {
        userid: verified.user.userid,
      };
      // Sign the JWT token and populate the payload with the user email and id
      const token = jwt.sign({ user: body }, config.jwt.secret, {
        expiresIn: '24h',
      });
      if (config.application.environment === 'development') {
        res.cookie('token', token, {
          maxAge: 24 * 60 * 60 * 1000,
          domain: 'localhost',
          secure: false,
          httpOnly: true,
        });
      } else {
        res.cookie('token', token, {
          maxAge: 24 * 60 * 60 * 1000,
          domain: 'retrospectacle.io',
          secure: true,
          httpOnly: true,
        });
      }
      res.status(200);
      return res.send();
    } catch (error) {
      res.status(401);
      return res.send();
    }
  },
  profile: (req, res) => {
    // This returns the profile for the current user extracted from the cookie
    if (req.user) {
      return res.send({
        userid: req.user.userid,
        email: req.user.email,
        nickname: req.user.nickname,
        picture: `https://www.gravatar.com/avatar/${md5(
          req.user.email.trim().toLowerCase(),
        )}?s=256`,
      });
    }
    res.status(401);
    return res.send();
  },
  forgotten: async (req, res) => {
    const { email } = req.body;
    if (!email) {
      res.status(400);
      return res.send();
    }
    // Get the user from the database
    const result = await pool.query(
      'SELECT * FROM users WHERE lower(email) = lower($1)',
      [email],
    );
    // If nothing found
    if (result.rowCount === 0) {
      res.status(400);
      return res.send();
    }
    const [user] = result.rows;

    // Generate the reset token
    user.resetToken = randomstring.generate(64);

    // Send an email to the user
    const mg = mailgun({
      apiKey: config.keys.mailgun,
      domain: 'mail.retrospectacle.io',
      host: 'api.eu.mailgun.net',
    });
    try {
      // Update the user in the database
      await pool.query(
        'UPDATE users SET resettoken = $1, updated = now() WHERE lower(email) = lower($2)',
        [user.resetToken, user.email],
      );
      // Send an email to the user with a reset link
      const message = `<h1>Forgotten Password</h1>
      <p>You are receiving this email because you told us that you have forgotten your password. 
      If you want to reset your password then please use the link below. 
      If you did not request this email then please ignore it.</p>
      <p><a href="${config.application.baseUrl}/auth/reset/${user.resetToken}/${user.userid}">Reset Your Password</a></p>`;
      const data = {
        from: 'RetroSpectacle <support@retrospectacle.io>',
        to: user.email,
        subject: 'Forgotten Password',
        html: message,
      };
      // The actual sending of the message
      mg.messages().send(data);
      // Simply return an empty 200 for now
      return res.send();
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
  reset: async (req, res) => {
    const { userid, resetToken, password } = req.body;
    // If any of the items are missing then return 400
    if (!userid || !resetToken || !password) {
      res.status(400);
      return res.send();
    }
    // Get the user from the database
    const result = await pool.query('SELECT * FROM users WHERE userid = $1', [
      userid,
    ]);
    // If no user then reject
    if (result.rowCount === 0) {
      res.status(400);
      return res.send();
    }
    const [user] = result.rows;
    // Check the validity of the reset token
    if (user.resettoken !== resetToken) {
      res.status(400);
      return res.send();
    }
    // Hash the password before writing
    const hashPassword = await bcrypt.hash(password, 10);
    try {
      // If all okay then update the password and remove the token
      await pool.query(
        'UPDATE users SET password = $1, resettoken = null, updated = now() WHERE userid = $2',
        [hashPassword, userid],
      );
      return res.send();
    } catch (error) {
      res.status(400);
      return res.send();
    }
  },
};
