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
    const auth0data = req.body;
    const user = {
      auth0id: auth0data.id,
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
};
