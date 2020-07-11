// Use axios for calling the management API
const axios = require('axios');
// Get configuration for the Auth0 management API
const config = require('../config/config');
// Use the usersService for datbase operations
const usersService = require('../services/usersService');

// The controller for users
module.exports = {
  // For getting all users
  getAll: async (req, res) => {
    const users = await usersService.getAll();
    res.status(200);
    return res.send(users);
  },
  // For the creation of new users
  create: async (req, res) => {
    const auth0user = await axios.get(
      `${config.auth0.management.audience}users/${req.body.user.id}`,
      {
        headers: { Authorization: `Bearer ${req.managementToken}` },
      },
    );
    // If we didn't find the data then return 400
    if (!auth0user.data) {
      res.status(400);
      return res.send();
    }
    const user = {
      auth0id: auth0user.data.user_id,
      nickname: auth0user.data.nickname || '',
      picture: auth0user.data.picture || '',
    };
    // Try and save the user (this will also validate the data)
    try {
      await usersService.create(user);
      res.status(200);
      return res.send();
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
  remove: async (req, res) => {
    await usersService.remove(req.params.userId);
    res.status(204);
    return res.send();
  },
};
