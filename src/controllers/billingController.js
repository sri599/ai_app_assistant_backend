const BillingSetting = require("../models/BillingSetting");
const CallLog = require("../models/CallLog");
const User = require("../models/User");

exports.saveBillingSettings = async (req, res) => {
  try {

    const {
      pricePerMinute,
      billingCycle,
      currency
    } = req.body;

    let settings = await BillingSetting.findOne();

    if (!settings) {

      settings = await BillingSetting.create({
        pricePerMinute,
        billingCycle,
        currency
      });

    } else {

      if (pricePerMinute != null)
        settings.pricePerMinute = pricePerMinute;

      if (billingCycle)
        settings.billingCycle = billingCycle;

      if (currency)
        settings.currency = currency;

      await settings.save();
    }

    res.json({
      success: true,
      message: "Billing settings saved successfully",
      settings
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

exports.getBillingSettings = async (req, res) => {

  try {

    let settings = await BillingSetting.findOne();

    if (!settings) {

      settings = await BillingSetting.create({
        pricePerMinute: 0.80,
        billingCycle: "monthly",
        currency: "INR"
      });

    }

    res.json({
      success: true,
      settings
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

exports.getAllUsersBillingSummary = async (req, res) => {
  try {

    const settings = await BillingSetting.findOne();

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Billing settings not configured"
      });
    }

    const now = new Date();
    let startDate = new Date();

    switch (settings.billingCycle) {

      case "daily":
        startDate.setHours(0, 0, 0, 0);
        break;

      case "weekly":
        startDate.setDate(now.getDate() - 7);
        break;

      case "monthly":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        );
        break;

      case "yearly":
        startDate = new Date(
          now.getFullYear(),
          0,
          1
        );
        break;
    }

    const users = await User.find({
      role: "user",
      isDeleted: false
    }).select("name phoneNumber aiNumber");

    const result = [];

    for (const user of users) {

      const logs = await CallLog.find({
        userId: user._id,
        createdAt: {
          $gte: startDate
        }
      }).select(
        "callDuration billedMinutes callCost"
      );

      const totalSeconds = logs.reduce(
        (sum, log) => sum + (log.callDuration || 0),
        0
      );

      const billedMinutes = logs.reduce(
        (sum, log) => sum + (log.billedMinutes || 0),
        0
      );

      const totalAmount = logs.reduce(
        (sum, log) => sum + (log.callCost || 0),
        0
      );

      result.push({

        userId: user._id,

        name: user.name,

        phoneNumber: user.phoneNumber,

        aiNumber: user.aiNumber,

        totalCalls: logs.length,

        totalDurationSeconds: totalSeconds,

        actualMinutes: Number(
          (totalSeconds / 60).toFixed(2)
        ),

        billedMinutes,

        totalAmount: Number(
          totalAmount.toFixed(2)
        )

      });
    }

    result.sort(
      (a, b) => b.totalAmount - a.totalAmount
    );

    res.json({

      success: true,

      billingCycle: settings.billingCycle,

      currency: settings.currency,

      users: result

    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

exports.getMyBillingSummary = async (req, res) => {

  try {

    const settings = await BillingSetting.findOne();

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Billing settings not configured"
      });
    }

    const now = new Date();

    let startDate = new Date();

    switch (settings.billingCycle) {

      case "daily":
        startDate.setHours(0, 0, 0, 0);
        break;

      case "weekly":
        startDate.setDate(now.getDate() - 7);
        break;

      case "monthly":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        );
        break;

      case "yearly":
        startDate = new Date(
          now.getFullYear(),
          0,
          1
        );
        break;
    }

    const logs = await CallLog.find({
      userId: req.userId,
      createdAt: {
        $gte: startDate
      }
    });

    const totalSeconds = logs.reduce(
      (sum, log) => sum + (log.callDuration || 0),
      0
    );

      
      const totalMinutes = totalSeconds / 60;
const billedMinutes = logs.reduce(
    (sum, log) =>
        sum + (log.billedMinutes || 0),
    0
);

const totalAmount = logs.reduce(
    (sum, log) =>
        sum + (log.callCost || 0),
    0
);

    res.json({

      success: true,

      billingCycle: settings.billingCycle,

      currency: settings.currency,

      pricePerMinute: settings.pricePerMinute,

      totalCalls: logs.length,

      totalDurationSeconds: totalSeconds,

     actualMinutes:
Number(totalMinutes.toFixed(2)),

billedMinutes,

      totalAmount

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

};

exports.getUserBillingSummary = async (req, res) => {

  try {

    const settings = await BillingSetting.findOne();

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Billing settings not configured"
      });
    }

    const now = new Date();

    let startDate = new Date();

    switch (settings.billingCycle) {

      case "daily":
        startDate.setHours(0, 0, 0, 0);
        break;

      case "weekly":
        startDate.setDate(now.getDate() - 7);
        break;

      case "monthly":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        );
        break;

      case "yearly":
        startDate = new Date(
          now.getFullYear(),
          0,
          1
        );
        break;
    }

   const logs = await CallLog.find({
    userId: req.params.userId,
    createdAt: {
        $gte: startDate
    }
}).select(
    "callDuration billedMinutes callCost"
);

    const totalSeconds = logs.reduce(
      (sum, log) => sum + (log.callDuration || 0),
      0
    );

    const totalMinutes = totalSeconds / 60;

const billedMinutes = logs.reduce(
    (sum, log) =>
        sum + (log.billedMinutes || 0),
    0
);

const totalAmount = logs.reduce(
    (sum, log) =>
        sum + (log.callCost || 0),
    0
);

    res.json({

      success: true,

      userId: req.params.userId,

      billingCycle: settings.billingCycle,

      currency: settings.currency,

      pricePerMinute: settings.pricePerMinute,

      totalCalls: logs.length,

      totalDurationSeconds: totalSeconds,

     actualMinutes:
Number(totalMinutes.toFixed(2)),

billedMinutes,

      totalAmount

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

};