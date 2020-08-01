// Use the boardsService for datbase operations
const teamsService = require('../services/teamsService');

// The controller for boards
module.exports = {
  // Get all simply returns all teams from the database for this user
  getAll: async (req, res) => {
    const teams = await teamsService.query({
      $or: [
        { members: { $elemMatch: { email: req.user.email } } },
        { userId: req.user.user_id },
      ],
    });
    res.status(200);
    return res.send(teams);
  },
  // Get a single board from the ID in the params
  get: async (req, res) => {
    try {
      const team = await teamsService.getById(req.params.teamId);
      // If we can't find the board then send a 404
      if (!team) {
        res.status(404);
        res.send();
      }
      res.status(200);
      return res.send(team);
      // If any errors, then catch and throw 500
    } catch (error) {
      res.status(500);
      return res.send(error);
    }
  },
  // For the creation of new teams
  create: async (req, res) => {
    const team = req.body;
    // Set the user for the team
    team.userId = req.user.user_id;
    // Set the created time
    team.created = Date.now();
    // Try and save the team (this will also validate the data)
    try {
      await teamsService.create(team);
      // If everything is inserted then return
      res.status(200);
      return res.send(team);
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
  update: async (req, res) => {
    // Find the new team sent in the request and the original as we need to compare
    const updatedTeam = req.body;
    const originalTeam = await teamsService.getById(req.params.teamId);

    // Changing the owner of the team is not allowed
    if (updatedTeam.userId !== originalTeam.userId) {
      res.status(400);
      return res.send();
    }

    // Remove the Id from the updated team
    delete updatedTeam._id;

    try {
      // Update the teams
      await teamsService.update(req.params.teamId, updatedTeam);
      res.status(200);
      return res.send(updatedTeam);
      // Return any errors back to the user
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
  remove: async (req, res) => {
    const team = await teamsService.getById(req.params.teamId);
    // Prevent users from deleting others boards
    if (!team || team.userId !== req.user.user_id) {
      res.status(404);
      return res.send();
    }
    // Remove the team and any columns
    await teamsService.remove(req.params.teamId);
    res.status(204);
    return res.send();
  },
  updateMembership: async (req, res) => {
    try {
      // Find the team requested
      const team = await teamsService.getById(req.params.teamId);
      // Find the membership to update
      const membership = team.members.find(
        (member) => member.email === req.user.email,
      );
      // Set to the new status
      membership.status = req.body.status;
      // Remove the id to allow saving
      delete team._id;
      teamsService.update(req.params.teamId, team);
      res.status(200);
      return res.send(team);
    } catch (error) {
      res.status(400);
      return res.send();
    }
  },
  removeMembership: async (req, res) => {
    // Find the team requested
    const team = await teamsService.getById(req.params.teamId);
    // If the team has any members, then remove this one
    if (team.members) {
      team.members = team.members.filter(
        (member) => member.email !== req.user.email,
      );
    }
    try {
      // Remove the id from the team to allow update
      delete team._id;
      // Update team and report success
      teamsService.update(req.params.teamId, team);
      res.status(200);
      return res.send(team);
    } catch (error) {
      res.status(400);
      return res.send();
    }
  },
};
