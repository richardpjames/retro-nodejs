// For hasing passwords
const bcrypt = require('bcrypt');
// Mailgun for emails
const mailgun = require('mailgun-js');
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

// Regular expression for password checking
const passCheck = /(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

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
          picture: `https://www.gravatar.com/avatar/${md5email}?s=256&d=retro`,
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
      picture: `https://www.gravatar.com/avatar/${md5email}?s=256&d=retro`,
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
      if (!passwordCheck || !req.session.user.userid === req.params.userid) {
        res.status(400);
        return res.send();
      }
      // If there is a new password then replace the old
      if (req.body.newPassword) {
        // If the password does not meet the requirements
        if (!req.body.newPassword.match(passCheck)) {
          res.status(400);
          return res.send();
        }
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
      // If update succesful then invalidate all other sessions (on password change)
      if (req.body.newPassword) {
        // Invalidate all other sessions
        await pool.query(
          `DELETE FROM session WHERE CAST(sess -> 'user' ->> 'userid' AS INTEGER) = $1 AND sid != $2`,
          [req.session.user.userid, req.session.id],
        );
      }
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
      // Regenerate the session to log in
      req.session.regenerate((err) => {
        if (err) {
          res.status(401);
          req.send();
        }
        // Set the session variable
        req.session.user = user;
        // Send back the token to the user
        res.status(200);
        return res.send();
      });
    } catch (error) {
      res.status(401);
      return res.send(error);
    }
  },
  logout: async (req, res) => {
    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        res.status(400);
        res.send();
      }
      // Send 200 response
      return res.send();
    });
  },
  profile: (req, res) => {
    // This returns the profile for the current user extracted from the cookie
    if (req.session.user) {
      return res.send({
        userid: req.session.user.userid,
        email: req.session.user.email,
        nickname: req.session.user.nickname,
        picture: `https://www.gravatar.com/avatar/${md5(
          req.session.user.email.trim().toLowerCase(),
        )}?s=256&d=retro`,
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
    // If the password does not meet the requirements
    if (!password.match(passCheck)) {
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
      // Invalidate all other sessions
      await pool.query(
        `DELETE FROM session WHERE CAST(sess -> 'user' ->> 'userid' AS INTEGER) = $1`,
        [userid],
      );
      return res.send();
    } catch (error) {
      res.status(400);
      return res.send();
    }
  },
  check: async (req, res) => {
    // If there is a user in the session then return 200
    if (req.session.user) {
      res.status(200);
      return res.send();
    }
    res.status(401);
    return res.send();
  },
};
