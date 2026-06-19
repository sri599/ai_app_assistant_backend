const bcrypt = require("bcryptjs");
const User = require("../models/User");
const subscriptions = require("../data/subscriptions");
 const AiNumber =
  require("../models/AiNumber");

  exports.deleteAiNumber =
  async (req, res) => {

    await AiNumber.findByIdAndDelete(
      req.params.id
    );

    res.json({
      success: true,
      message:
        "Deleted successfully"
    });
  };
  exports.getAiNumbers =
  async (req, res) => {

    const numbers =
      await AiNumber.find()
        .populate(
          "assignedTo",
          "name phoneNumber"
        );

    res.json({
      success: true,
      numbers
    });
  };
exports.dashboard = async (req, res) => {
  try {

    const totalUsers =
      await User.countDocuments({
        role: "user"
      });

    const totalAdmins =
      await User.countDocuments({
        role: "admin"
      });

    const totalAiNumbers =
      await AiNumber.countDocuments();

    const assignedNumbers =
      await AiNumber.countDocuments({
        status: "assigned"
      });

    const freeNumbers =
      await AiNumber.countDocuments({
        status: "free"
      });

    const activeSubscriptions =
      await User.countDocuments({
        subscriptionStatus: "active"
      });

    res.json({
      success: true,

      totalUsers,
      totalAdmins,

      totalAiNumbers,
      assignedNumbers,
      freeNumbers,

      activeSubscriptions
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getUsers = async (
  req,
  res
) => {
  try {

    const users =
      await User.find()
        .select("-password");

    res.json({
      success: true,
      users
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error.message
    });
  }
};
exports.getUserById =
  async (req, res) => {
    try {

      const user =
        await User.findById(
          req.params.id
        ).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found"
        });
      }

      res.json({
        success: true,
        user
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };
exports.assignAiNumber =
  async (req, res) => {
    try {

      const {
        userId,
        aiNumber
      } = req.body;

      const user =
        await User.findById(
          userId
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found"
        });
      }

      user.aiNumber =
        aiNumber;

      await user.save();

      res.json({
        success: true,
        message:
          "AI number assigned"
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };
exports.createAdmin = async (
  req,
  res
) => {
  try {

    const {
      name,
      phoneNumber,
      password
    } = req.body;

    const existingUser =
      await User.findOne({
        phoneNumber
      });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "User already exists"
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const admin = new User({
      name,
      phoneNumber,
      password:
        hashedPassword,
      role: "admin"
    });

    await admin.save();

    res.json({
      success: true,
      message:
        "Admin created",
      admin
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error.message
    });
  }
};

exports.getAdmins =
  async (req, res) => {
    try {

      const admins =
        await User.find({
          role: "admin"
        }).select(
          "-password"
        );

      res.json({
        success: true,
        admins
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };

  exports.deleteAdmin =
  async (req, res) => {
    try {

      const admin =
        await User.findOneAndDelete({
          _id: req.params.id,
          role: "admin"
        });

      if (!admin) {
        return res.status(404).json({
          success: false,
          message:
            "Admin not found"
        });
      }

      res.json({
        success: true,
        message:
          "Admin deleted"
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };

exports.addAiNumber =
  async (req, res) => {
    try {

      const {
        phoneNumber
      } = req.body;

      const existing =
        await AiNumber.findOne({
          phoneNumber
        });

      if (existing) {
        return res.status(400).json({
          success: false,
          message:
            "Number already exists"
        });
      }

      const number =
        await AiNumber.create({
          phoneNumber
        });

      res.json({
        success: true,
        number
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };