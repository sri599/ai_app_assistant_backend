const bcrypt = require("bcryptjs");
const users = require("../data/users");
const subscriptions = require("../data/subscriptions");

exports.dashboard = (req, res) => {
  const totalUsers = users.filter(
    (u) => u.role === "user"
  ).length;

  const activeSubscriptions =
    subscriptions.filter(
      (s) => s.status === "active"
    ).length;

  const totalRevenue =
    subscriptions.reduce(
      (sum, item) => sum + item.amount,
      0
    );

  res.json({
    success: true,
    totalUsers,
    activeSubscriptions,
    totalRevenue
  });
};

exports.getUsers = (req, res) => {
  res.json({
    success: true,
    users
  });
};

exports.getUserById = (req, res) => {
  const user = users.find(
    (u) => u.id === req.params.id
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  res.json({
    success: true,
    user
  });
};

exports.assignAiNumber = (req, res) => {
  const { userId, aiNumber } = req.body;

  const user = users.find(
    (u) => u.id === userId
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  user.aiNumber = aiNumber;

  res.json({
    success: true,
    message: "AI number assigned"
  });
};
exports.createAdmin = async (req, res) => {
  try {
    const { name, phoneNumber, password } = req.body;

    const existingUser = users.find(
      (u) => u.phoneNumber === phoneNumber
    );

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const admin = {
      id: Date.now().toString(),
      name,
      phoneNumber,
      password: hashedPassword,
      role: "admin",
      createdAt: new Date()
    };

    users.push(admin);

    res.json({
      success: true,
      message: "Admin created",
      admin
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.getAdmins = (req, res) => {

  const admins = users.filter(
    (u) => u.role === "admin"
  );

  res.json({
    success: true,
    admins
  });
};
exports.deleteAdmin = (req, res) => {

  const index = users.findIndex(
    (u) =>
      u.id === req.params.id &&
      u.role === "admin"
  );

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Admin not found"
    });
  }

  users.splice(index, 1);

  res.json({
    success: true,
    message: "Admin deleted"
  });
};