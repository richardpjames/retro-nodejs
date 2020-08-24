// Get connection to the database
const postgres = require('../db/postgres');
// The connection pool
const pool = postgres.pool();

// The controller for templates
module.exports = {
  // Get all simply returns all templates from the database
  getAll: async (req, res) => {
    const result = await pool.query('SELECT * FROM templates');
    res.status(200);
    return res.send(result.rows);
  },
  // Get a single board from the ID in the params
  get: async (req, res) => {
    const result = await pool.query(
      'SELECT * FROM templates WHERE templateid = $1',
      [req.params.templateid],
    );
    // Return 404 if the template is not found
    if (result.rowCount === 0) {
      res.status(404);
      return res.send();
    }
    // Otherwise return the template and a 200
    res.status(200);
    return res.send(result.rows[0]);
  },
  // For the creation of new templates
  create: async (req, res) => {
    // Try and save the template (this will also validate the data)
    try {
      const result = await pool.query(
        'INSERT INTO templates (name, description, instructions, maxvotes, created, updated) VALUES ($1, $2, $3, $4, now(), now()) RETURNING *',
        [
          req.body.name,
          req.body.description,
          req.body.instructions,
          req.body.maxvotes,
        ],
      );
      res.status(200);
      return res.send(result.rows[0]);
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
  // Update existing template
  update: async (req, res) => {
    try {
      // Get the template from the database
      const result = await pool.query(
        'SELECT * FROM templates WHERE templateid = $1',
        [req.params.templateid],
      );
      // If no template then return an error
      if (result.rowCount === 0) {
        res.status(400);
        return res.send();
      }
      // Get the team from the query
      // Update the template, falling back on any previous values
      const result2 = await pool.query(
        'UPDATE templates SET name = $1, description = $2, instructions = $3, maxvotes = $4, updated = now() WHERE templateid = $5 RETURNING *',
        [
          req.body.name,
          req.body.description,
          req.body.instructions,
          req.body.maxvotes,
          req.params.templateid,
        ],
      );
      return res.send(result2.rows[0]);
    } catch (error) {
      res.status(400);
      return res.send(error);
    }
  },
};
