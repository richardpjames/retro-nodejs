// The controller for boards
const boardsController = () => {
  // Get all simply returns all boards from the database
  const getAll = (req, res) => {
    res.send({
      boardId: 1,
      title: 'This is a board',
      description: 'Testing out of routing',
    });
  };
  // Return each of the functions in the controller
  return { getAll };
};

module.exports = boardsController();
