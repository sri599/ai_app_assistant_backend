const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const users = require("../data/users");

exports.register = async (req, res) => {
  try {
    const { name, phoneNumber, password } = req.body;

    const existingUser = users.find(
      (u) => u.phoneNumber === phoneNumber
    );

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

const user = {
  id: Date.now().toString(),
  name,
  phoneNumber,
  password: hashedPassword,
  aiNumber: null,
  subscriptionStatus: "inactive",
  subscription: null,
  role: "user"
};

    users.push(user);

    res.json({
      success: true,
      message: "User registered",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    const user = users.find(
      (u) => u.phoneNumber === phoneNumber
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    res.json({
  success: true,
  token,
  role: user.role
});
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.profile = async (req, res) => {
  const user = users.find(
    (u) => u.id === req.userId
  );

  res.json({
    success: true,
    user,
  });
};