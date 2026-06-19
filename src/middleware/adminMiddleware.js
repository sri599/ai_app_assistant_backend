const User = require("../models/User");

module.exports = async (
  req,
  res,
  next
) => {
  try {
    const user =
      await User.findById(
        req.userId
      );

    if (
      !user ||
      user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Admin access required"
      });
    }

    next();

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};