// This simple middleware checks if a user has the required permissions
module.exports = (permission) => {
  return (req, res, next) => {
    const permissionCheck = req.user.permissions.find(
      (p) => p.permission_name === permission,
    );
    if (permissionCheck) return next();
    res.status(401);
    return res.send();
  };
};
