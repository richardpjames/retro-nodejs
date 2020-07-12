// Use the usersService for datbase operations
const usersService = require('../services/usersService');

// The controller for users
module.exports = {
  // For getting all users
  getAll: async (req, res) => {
    usersService.getAll(req.managementToken, (err, users) => {
      if (!users) {
        res.status(404);
        return res.send();
      }
      res.status(200);
      return res.send(users);
    });
  },
  // For getting a single user
  getById: async (req, res) => {
    usersService.getById(
      req.params.userId,
      req.managementToken,
      (err, user) => {
        if (!user) {
          res.status(404);
          return res.send();
        }
        res.status(200);
        return res.send(user);
      },
    );
  },
};
