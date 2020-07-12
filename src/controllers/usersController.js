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
    // If we have users then don't expose anything untoward, just the id,  nicknames and pictures
    const returnedUsers = [];
    await Promise.all(
      users.map((user) =>
        returnedUsers.push({
          id: user.user_id,
          nickName: user.nickname,
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
    res.status(200);
    return res.send({
      id: user.user_id,
      nickName: user.nickname,
      picture: user.picture,
    });
  },
};
