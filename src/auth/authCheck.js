module.exports = async (req, res, next) => {
  // If there is no session user then reject
  if (!req.session.user) {
    res.status(401);
    return res.send();
  }
  // Otherwise continue
  return next();
};
