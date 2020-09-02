// Get the connection to the database
const postgres = require('../db/postgres');
// Get the database pool
const pool = postgres.pool();

// The controller for boards
module.exports = {
  // Get all simply returns all teams from the database for this user
  getAll: async (req, res) => {
    try {
      const response = await pool.query(
        `SELECT tm.*, t.uuid as teamuuid FROM teammembers tm INNER JOIN teams t ON tm.teamid = t.teamid WHERE t.teamid = $1`,
        [req.params.teamid],
      );
      res.status(200);
      return res.send(response.rows);
    } catch (error) {
      res.status(400);
      return res.send();
    }
  },
  // Get a single team from the ID in the params
  get: async (req, res) => {
    try {
      // TODO: This should check whether the user can access the team
      // Get the team
      const response = await pool.query(
        'SELECT tm.*, t.uuid as teamuuid FROM teammembers tm INNER JOIN teams t ON tm.teamid = t.teamid WHERE t.uuid = $1 AND tm.memberid = $2',
        [req.params.teamid, req.params.memberid],
      );
      // If we can't find the board then send a 404
      if (response.rowCount === 0) {
        res.status(404);
        return res.send();
      }
      res.status(200);
      return res.send(response.rows[0]);
      // If any errors, then catch and throw 500
    } catch (error) {
      res.status(500);
      return res.send(error);
    }
  },
  // For the creation of new teams
  create: async (req, res) => {
    // Try and save the team
    try {
      const response = await pool.query(
        `INSERT INTO teammembers (email, teamid, status, created, updated) VALUES (lower($1), $2, 'invited', now(), now()) RETURNING *`,
        [req.body.email, req.params.teamid],
      );
      // If everything is inserted then return
      res.status(200);
      return res.send({ ...response.rows[0], teamuuid: req.params.teamid });
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
  update: async (req, res) => {
    try {
      // Update the member
      const result = await pool.query(
        'UPDATE teammembers SET status = $1, updated = now() WHERE teamid = $2 AND memberid = $3 RETURNING *',
        [req.body.status, req.params.teamid, req.params.memberid],
      );
      return res.send(result.rows[0]);
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
  remove: async (req, res) => {
    // Remove the team (checking userid)
    const response = await pool.query(
      'DELETE FROM teammembers WHERE memberid = $1 AND teamid = $2',
      [req.params.memberid, req.params.teamid],
    );
    // Check that any teams were actually deleted
    if (response.rowCount === 0) {
      res.status(404);
      return res.send();
    }
    // If all okay return 204
    res.status(200);
    return res.send({ message: 'Deleted' });
  },
};
