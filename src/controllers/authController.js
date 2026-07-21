const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.register = async (req, res) => {
  try {
    const {
  name,
  phoneNumber,
  email,
  password
} = req.body;

    const existingUser = await User.findOne({
      phoneNumber
    });

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

    const user = new User({
      name,
      phoneNumber,
      email: email || null,
      password: hashedPassword,
      role: "user",
      aiNumber: null,
      subscriptionStatus: "inactive",
      subscription: null,
      fcmToken: null,
    });

    await user.save();

    res.json({
      success: true,
      message: "User registered",
      user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const {
  phoneNumber,
  password,
  fcmToken
} = req.body;

    const user = await User.findOne({
      phoneNumber
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    if (user.isDeleted) {
      return res.status(403).json({
        success: false,
        deleted: true,
        code: "ACCOUNT_DEACTIVATED",
        deletedAt: user.deletedAt,
        message:
          "Your account has been deactivated. Please contact support.",
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
    if (fcmToken) {
  user.fcmToken = fcmToken;
  await user.save();
}

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      success: true,
      token,
      role: user.role,
      deleted: false,
      deletedAt: null,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.googleLogin = async (req, res) => {
  try {
    const { idToken, fcmToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Google ID token is required.",
      });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const email = payload.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Google account does not have a valid email.",
      });
    }

    // Find registered user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email. Please register first.",
      });
    }

    if (user.isDeleted) {
      return res.status(403).json({
        success: false,
        deleted: true,
        code: "ACCOUNT_DEACTIVATED",
        message:
          "Your account has been deactivated. Please contact support.",
      });
    }

    // Save latest FCM token
    if (fcmToken) {
      user.fcmToken = fcmToken;
      await user.save();
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    return res.json({
      success: true,
      token,
      role: user.role,
      deleted: false,
      deletedAt: null,
    });

  } catch (error) {
    console.error(error);

    return res.status(401).json({
      success: false,
      message: "Google authentication failed.",
    });
  }
};

exports.profile = async (req, res) => {
  try {
    const user = await User.findById(
      req.userId
    ).select("-password");

    res.json({
      success: true,
      user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};