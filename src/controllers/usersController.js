// Jwt for authorisation
const jwt = require('jsonwebtoken');
// Mailgun for emails
const mailgun = require('mailgun-js');
// md5 for gravatar
const md5 = require('md5');
// For generating tokens
const randomstring = require('randomstring');
// Use the usersService for datbase operations
const usersService = require('../services/usersService');
// Get configuration
const config = require('../config/config');

// The controller for users
module.exports = {
  // For getting all users
  getAll: async (req, res) => {
    const users = await usersService.getAll();
    if (!users) {
      res.status(404);
      return res.send();
    }
    // If we have users then don't expose anything untoward, just the id,  nicknames and pictures
    const returnedUsers = [];
    await Promise.all(
      users.map((user) =>
        returnedUsers.push({
          id: user.user_id,
          nickname: user.nickname,
          picture: user.picture,
        }),
      ),
    );
    res.status(200);
    return res.send(returnedUsers);
  },
  // For getting a single user
  getById: async (req, res) => {
    const user = await usersService.getById(
      req.params.userId,
      req.managementToken,
    );
    if (!user) {
      res.status(404);
      return res.send();
    }
    // If the user is requesting their own details then send all
    if (user.user_id === req.user._id) {
      res.status(200);
      return res.send({ id: user.user_id, ...user });
    }
    // Otherwise send only basic information
    res.status(200);
    return res.send({
      id: user.user_id,
      nickName: user.nickname,
      picture: `https://www.gravatar.com/avatar/${md5(
        user.email.trim().toLowerCase(),
      )}?s=256`,
    });
  },
  create: async (req, res) => {
    try {
      // Get the user from the body
      const user = req.body;
      // Get rid of confirmPassword if it was passed in
      delete user.confirmPassword;
      // Check if there is a duplicate email address
      const checkUser = await usersService.getByEmail(user.email);
      if (checkUser) {
        res.status(400);
        return res.send();
      }
      // Save the information provided by the user to the the database
      await usersService.create(user);
      // Send the user information back to the user (without the password)
      delete user.password;
      return res.send(user);
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
  update: async (req, res) => {
    const updatedUser = req.body;
    const user = await usersService.getById(req.params.userId);
    // If no user then return an error
    if (!user) {
      res.status(400);
      return res.send();
    }
    // Check that the user is the current user and check their password
    const passwordCheck = await usersService.checkPassword(
      user,
      updatedUser.password,
    );
    // If the password is incorrect or this isn't the current user
    if (!passwordCheck || !req.user._id.equals(user._id)) {
      res.status(400);
      return res.send();
    }
    let hashPassword = false;
    // If there is a new password then replace the old
    if (updatedUser.newPassword) {
      updatedUser.password = updatedUser.newPassword;
      delete updatedUser.newPassword;
      hashPassword = true;
    }
    // Update the user
    delete updatedUser._id;
    await usersService.update(req.params.userId, updatedUser, hashPassword);
    // Return the updated user
    delete updatedUser.password;
    return res.send(updatedUser);
  },
  login: async (req, res) => {
    try {
      // Get the request from the body
      const request = req.body;
      // Get the user from the service
      const user = await usersService.getByEmail(request.email);
      // If there is no user with that email
      if (!user) {
        res.status(401);
        return res.send();
      }
      // If there is a user then check the password
      const passwordCheck = await usersService.checkPassword(
        user,
        request.password,
      );
      // If there is an issue with the password
      if (!passwordCheck) {
        res.status(401);
        return res.send();
      }
      // Otherwise send the user details in the token body
      const body = {
        _id: user._id,
        email: user.email,
        nickname: user.nickname,
        picture: `https://www.gravatar.com/avatar/${md5(
          user.email.trim().toLowerCase(),
        )}?s=256`,
      };
      // Sign the JWT token and populate the payload with the user email and id
      const token = jwt.sign({ user: body }, config.jwt.secret, {
        expiresIn: '24h',
      });
      // Send back the token to the user
      res.status(200);
      if (config.application.environment === 'development') {
        res.cookie('token', token, {
          maxAge: 24 * 60 * 60 * 1000,
          domain: 'localhost',
          secure: false,
          httpOnly: true,
        });
        res.cookie('isAuthenticated', true, {
          maxAge: 24 * 60 * 60 * 1000,
          domain: 'localhost',
        });
      } else {
        res.cookie('token', token, {
          maxAge: 24 * 60 * 60 * 1000,
          domain: 'retrospectacle.io',
          secure: true,
          httpOnly: true,
        });
        res.cookie('isAuthenticated', true, {
          maxAge: 24 * 60 * 60 * 1000,
          domain: 'retrospectacle.io',
        });
      }
      return res.send();
    } catch (error) {
      res.status(401);
      return res.send(error);
    }
  },
  profile: (req, res) => {
    // This returns the profile for the current user extracted from the cookie
    if (req.user) {
      return res.send({
        _id: req.user._id,
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
    const user = await usersService.getByEmail(email);
    // If there is no user found then return an error
    if (!user) {
      res.status(400);
      return res.send();
    }
    // Remove the Id for easier working
    const userId = user._id;
    delete user._id;
    user.resetToken = randomstring.generate(64);

    // Send an email to the user
    const mg = mailgun({
      apiKey: config.keys.mailgun,
      domain: 'mail.retrospectacle.io',
      host: 'api.eu.mailgun.net',
    });
    try {
      // Update the user in the database
      await usersService.update(userId, user, false);
      // Send an email to the user with a reset link
      const message = `<h1>Forgotten Password</h1>
      <p>You are receiving this email because you told us that you have forgotten your password. 
      If you want to reset your password then please use the link below. 
      If you did not request this email then please ignore it.</p>
      <p><a href="${config.application.baseUrl}/auth/reset/${user.resetToken}/${userId}">Reset Your Password</a></p>`;
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
    const { userId, resetToken, password } = req.body;
    // If any of the items are missing then return 400
    if (!userId || !resetToken || !password) {
      res.status(400);
      return res.send();
    }
    const user = await usersService.getById(userId);
    // Check the validity of the reset token
    if (user.resetToken !== resetToken) {
      res.status(400);
      return res.send();
    }
    delete user._id;
    // If all okay then update the password and remove the token
    user.password = password;
    delete user.resetToken;
    try {
      await usersService.update(userId, user, true);
      return res.send();
    } catch (error) {
      res.status(400);
      return res.send();
    }
  },
};
