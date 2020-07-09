// The controller for boards
const boardsController = {
  // Get all simply returns all boards from the database
  getAll: (req, res) => {
    res.send({
      boardId: 1,
      title: 'This is a board',
      description: 'Testing out of routing',
    });
  },
};

module.exports = boardsController;
