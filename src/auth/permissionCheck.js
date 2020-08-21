// This simple middleware checks if a user has the required permissions
module.exports = () => {
  return (req, res, next) => {
    if (req.user.email === 'richard@richardpjames.com') return next();
    res.status(401);
    return res.send();
  };
};
