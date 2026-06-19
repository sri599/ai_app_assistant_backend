const AiNumber = require("../models/AiNumber");
const User = require("../models/User");

exports.freeNumbers = async (req, res) => {
  try {
    const numbers = await AiNumber.find({
      status: "free"
    });

    res.json({
      success: true,
      numbers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.myNumber = async (req, res) => {
  try {
    const user = await User.findById(
      req.userId
    ).select(
      "name phoneNumber aiNumber"
    );

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

exports.assignNumber = async (
  req,
  res
) => {
  try {
    const { aiNumberId } = req.body;

    const user = await User.findById(
      req.userId
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.aiNumber) {
      return res.status(400).json({
        success: false,
        message:
          "AI Number already assigned"
      });
    }

    const number =
      await AiNumber.findById(
        aiNumberId
      );

    if (!number) {
      return res.status(404).json({
        success: false,
        message:
          "AI Number not found"
      });
    }

    if (
      number.status ===
      "assigned"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "AI Number already assigned"
      });
    }

    user.aiNumber =
      number.phoneNumber;

    await user.save();

    number.status =
      "assigned";

    number.assignedTo =
      user._id;

    await number.save();

    res.json({
      success: true,
      message:
        "AI Number assigned successfully",
      aiNumber:
        number.phoneNumber
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.changeNumber = async (
  req,
  res
) => {
  try {
    const { aiNumberId } = req.body;

    const user = await User.findById(
      req.userId
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const newNumber =
      await AiNumber.findById(
        aiNumberId
      );

    if (!newNumber) {
      return res.status(404).json({
        success: false,
        message:
          "AI Number not found"
      });
    }

    if (
      newNumber.status ===
      "assigned"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "AI Number already assigned"
      });
    }

    if (user.aiNumber) {
      const oldNumber =
        await AiNumber.findOne({
          phoneNumber:
            user.aiNumber
        });

      if (oldNumber) {
        oldNumber.status =
          "free";

        oldNumber.assignedTo =
          null;

        await oldNumber.save();
      }
    }

    user.aiNumber =
      newNumber.phoneNumber;

    await user.save();

    newNumber.status =
      "assigned";

    newNumber.assignedTo =
      user._id;

    await newNumber.save();

    res.json({
      success: true,
      message:
        "AI Number changed successfully",
      aiNumber:
        newNumber.phoneNumber
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.releaseNumber =
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.userId
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found"
        });
      }

      if (!user.aiNumber) {
        return res.status(400).json({
          success: false,
          message:
            "No AI Number assigned"
        });
      }

      const number =
        await AiNumber.findOne({
          phoneNumber:
            user.aiNumber
        });

      if (number) {
        number.status =
          "free";

        number.assignedTo =
          null;

        await number.save();
      }

      user.aiNumber = null;

      await user.save();

      res.json({
        success: true,
        message:
          "AI Number released successfully"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };