
const users = require("../data/users");

module.exports = (req, res, next) => {
  const user = users.find(
    (u) => u.id === req.userId
  );

  if (!user || user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required"
    });
  }

  next();
};