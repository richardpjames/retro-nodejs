// Use the usersService for datbase operations
const usersService = require('../services/usersService');

// The controller for users
module.exports = {
  // For getting all users
  getAll: async (req, res) => {
    const users = await usersService.getAll(req.managementToken);
    if (!users) {
      res.status(404);
      return res.send();
    }
    res.status(200);
    return res.send(users);
  },
  // For getting a single user
  getById: async (req, res) => {
    const user = usersService.getById(req.params.userId, req.managementToken);
    if (!user) {
      res.status(404);
      return res.send();
    }
    res.status(200);
    return res.send(user);
  },
};
