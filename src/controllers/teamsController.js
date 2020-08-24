// Get the connection to the database
const postgres = require('../db/postgres');
// Get the database pool
const pool = postgres.pool();

// The controller for boards
module.exports = {
  // Get all simply returns all teams from the database for this user
  getAll: async (req, res) => {
    const response = await pool.query(
      'SELECT t.* FROM teams t LEFT JOIN teammembers tm ON t.teamid = t.teamid WHERE t.userid = $1 or tm.email = $2',
      [req.user.userid, req.user.email],
    );
    res.status(200);
    return res.send(response.rows);
  },
  // Get a single board from the ID in the params
  get: async (req, res) => {
    try {
      // Get the team
      const response = await pool.query(
        'SELECT * FROM teams WHERE teamid = $1',
        [req.params.teamid],
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
        'INSERT INTO teams (name, userid, created, updated) VALUES ($1, $2, now(), now()) RETURNING *',
        [req.body.name, req.user.userid],
      );
      // If everything is inserted then return
      res.status(200);
      return res.send(response.rows[0]);
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
  update: async (req, res) => {
    try {
      // Get the team from the database
      const result = await pool.query('SELECT * FROM teams WHERE teamid = $1', [
        req.params.teamid,
      ]);
      // If no team then return an error
      if (result.rowCount === 0) {
        res.status(400);
        return res.send();
      }
      // Get the team from the query
      const [team] = result.rows;
      // Update the team, falling back on any previous values
      const result2 = await pool.query(
        'UPDATE teams SET name = $1, updated = now() WHERE teamid = $3 RETURNING *',
        [req.body.name || team.name, req.params.teamid],
      );
      return res.send(result2.rows[0]);
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
  remove: async (req, res) => {
    // Remove the team (checking userid)
    const response = await pool.query(
      'DELETE FROM teams WHERE teamid = $1 AND userid = $2',
      [req.params.teamid, req.user.userid],
    );
    // Check that any teams were actually deleted
    if (response.rowCount === 0) {
      res.status(404);
      return res.send();
    }
    // If all okay return 204
    res.status(204);
    return res.send();
  },
  updateMembership: async (req, res) => {
    try {
      // Update the membership table
      const response = await pool.query(
        'UPDATE teammembers SET status = $1, updated = now() WHERE teamid = $2 AND email = $3',
        [req.body.status, req.params.teamid, req.user.email],
      );
      if (response.rowCount === 0) {
        res.status(400);
        return res.send();
      }
      res.status(200);
      return res.send();
    } catch (error) {
      res.status(400);
      return res.send();
    }
  },
  removeMembership: async (req, res) => {
    try {
      // Delete from the membership table
      const response = await pool.query(
        'DELETE FROM teammembers WHERE memberid = $1 AND email = $2',
        [req.params.memberid, req.user.email],
      );
      if (response.rowCount === 0) {
        res.status(400);
        return res.send();
      }
      res.status(200);
      return res.send();
    } catch (error) {
      res.status(400);
      return res.send();
    }
  },
};
