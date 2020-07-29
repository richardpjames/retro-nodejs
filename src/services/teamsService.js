// For generating object Ids
const { ObjectId } = require('mongodb');
// Connection to the database
const mongo = require('../db/mongo');
// The team model
const teamModel = require('../models/teamModel');
// Get the database connection
const db = mongo.db();

module.exports = {
  // Retrieve all teams
  getAll: async () => {
    return db.collection('teams').find().toArray();
  },
  // Retrieve a team using its ID
  getById: async (teamId) => {
    return db.collection('teams').findOne({ _id: ObjectId(teamId) });
  },
  query: async (query) => {
    return db.collection('teams').find(query).toArray();
  },
  // Create a new team in the database
  create: async (team) => {
    // First validate against the model
    const errors = teamModel.validate(team);
    // If no validation errors then create the team
    if (!errors.error) {
      return db.collection('teams').insertOne(team);
    }
    throw errors.error.details;
  },
  // Replace a team with a new one
  update: async (teamId, team) => {
    // Validate the updated team against the model
    const errors = teamModel.validate(team);
    // If no validation errors then update the team
    if (!errors.error) {
      await db.collection('teams').replaceOne({ _id: ObjectId(teamId) }, team);
    } else {
      throw errors.error.details;
    }
  },
  // Remove a team from the database
  remove: async (teamId) => {
    return db.collection('teams').deleteOne({ _id: ObjectId(teamId) });
  },
};
