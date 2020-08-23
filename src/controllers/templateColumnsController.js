// Get connection to the database
const postgres = require('../db/postgres');
// The connection pool
const pool = postgres.pool();

// The controller for templates
module.exports = {
  // Get all simply returns all templates from the database
  getAll: async (req, res) => {
    const response = await pool.query(
      'SELECT * FROM templatecolumns WHERE tempalteid = $1',
      [req.params.templateId],
    );
    const templateComlumns = response.rows;
    res.status(200);
    return res.send(templateComlumns);
  },
  // For the creation of new templates
  create: async (req, res) => {
    try {
      const response = await pool.query(
        'INSERT INTO templatecolumns (title, rank, templateid, created, updated) VALUES ($1, $2, $3, now(), now()) RETURNING *',
        [req.body.title, req.body.rank, req.params.templateId],
      );
      res.status(200);
      return res.send(response.rows[0]);
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
};
