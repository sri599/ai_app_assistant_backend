const CallLog = require("../models/CallLog");
const User = require("../models/User");
const mongoose = require("mongoose");

const { sendPushNotification } = require("../utils/pushNotification");
const { sendEmail } = require("../utils/email");
const BillingSetting =
require("../models/BillingSetting");
exports.createCallLog = async (
  req,
  res
) => {
  try {

    const call =
      req.body.call || {};

    const analytics =
      req.body.analytics || {};

    const extra =
      analytics.extra_information || {};
    const existingCall = await CallLog.findOne({
    call_id: call.id
});

if (existingCall) {
    return res.json({
        success: true,
        message: "Call log already exists"
    });
}

    // Match user by last 10 digits of AI number
    const targetNumber =
      (extra.to || "").slice(-10);

    const user =
      await User.findOne({
        aiNumber: {
          $regex: targetNumber + "$"
        }
      });
       const normalize = (num = "") =>
  num.replace(/\D/g, "").slice(-10);

const isTestCall =
  user &&
  normalize(user.phoneNumber) === normalize(extra.from);

    console.log(
      "Incoming AI Number:",
      extra.to
    );

    console.log(
      "Matched User:",
      user?._id
    );
    const setting =
await BillingSetting.findOne();

const rate =
setting?.pricePerMinute || 0.80;

const duration =
parseFloat(call.duration_seconds || 0);

const billedMinutes = Math.ceil(duration / 60);

const cost = Number(
    (billedMinutes * rate).toFixed(2)
);

    const callLog =
      await CallLog.create({

        userId:
          user?._id || null,

        summary:
          analytics.summary || "",

        outcome:
          analytics.outcome || "",

        fromNumber:
          extra.from ||
          call.caller ||
          "Unknown",

        toNumber:
          extra.to ||
          "Unknown",

        callDuration: duration,

        callRecordingURL:
          call.recording_url || "",

        callEndReason:
          call.end_reason || "",

        agentId:
          call.agent_id || "",

        callType:
          call.direction === "inbound"
            ? "inbound"
            : "outbound",

        taskId: "",

        attempt: 1,

        call_id:
          call.id,

        turns:
          call.tool_calls_count || 0,

        name:
          extra.name ||
          extra.Name ||
          "Caller",

        LeadCode: null,

        StatusId: null,
      
    billingRate: rate,
    billedMinutes: billedMinutes,


    callCost: cost,

    billed: false,
    isTestCall
      });
    if (user && user.fcmToken) {
  await sendPushNotification(
    user.fcmToken,
    "New AI Call",
    `You received a ${callLog.callType} call from ${callLog.fromNumber}.`,
    {
      callId: callLog._id.toString(),
      type: "call_log"
    }
  );
}
if (user?.email) {
  await sendEmail(
    user.email,
    "New AI Call Received",
    `
      <h2>New AI Call</h2>

      <p>Hello ${user.name || "User"},</p>

      <p>Your AI assistant has received a new call.</p>

      <table border="1" cellpadding="8" cellspacing="0">
        <tr>
          <td><b>Caller</b></td>
          <td>${callLog.fromNumber}</td>
        </tr>
        <tr>
          <td><b>Type</b></td>
          <td>${callLog.callType}</td>
        </tr>
        <tr>
          <td><b>Duration</b></td>
          <td>${callLog.callDuration} seconds</td>
        </tr>
        <tr>
          <td><b>Cost</b></td>
          <td>₹${callLog.callCost}</td>
        </tr>
      </table>

      <p>Thank you,<br>Sharyx AI Assistant</p>
    `
  );
}

    res.status(201).json({
      success: true,
      message:
        "Call log created successfully",
      callLog
    });

  } catch (error) {

    console.error(
      "Create Call Log Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.getUserCallLogsForAdmin = async (req, res) => {
  try {

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 20, 1);
    const skip = (page - 1) * limit;

    const filter = {
      userId: req.params.userId
    };

    const [logs, totalRecords] = await Promise.all([
      CallLog.find(filter)
        .populate("userId", "name phoneNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      CallLog.countDocuments(filter)
    ]);

    res.json({
      success: true,
      page,
      limit,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      hasNextPage: page * limit < totalRecords,
      hasPrevPage: page > 1,
      count: logs.length,
      logs
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.getBillingCallLogs = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 20, 1);
    const skip = (page - 1) * limit;

    const filter = {
      userId: req.params.userId,
      isTestCall: false,
      billed: false
    };

    const [logs, totalRecords] = await Promise.all([
      CallLog.find(filter)
        .populate("userId", "name phoneNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      CallLog.countDocuments(filter)
    ]);

    res.json({
      success: true,
      page,
      limit,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      hasNextPage: page * limit < totalRecords,
      hasPrevPage: page > 1,
      count: logs.length,
      logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCallLogs = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 20, 1);
    const skip = (page - 1) * limit;

    const filter = {};

    const [logs, totalRecords] = await Promise.all([
      CallLog.find(filter)
        .populate("userId", "name phoneNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      CallLog.countDocuments(filter)
    ]);

    res.json({
      success: true,
      page,
      limit,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      hasNextPage: page * limit < totalRecords,
      hasPrevPage: page > 1,
      count: logs.length,
      logs
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.getMyCallLogs = async (req, res) => {
  try {

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 20, 1);
    const skip = (page - 1) * limit;

    const filter = {
      userId: req.userId
    };

    const [logs, totalRecords] = await Promise.all([
      CallLog.find(filter)
        .populate("userId", "name phoneNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      CallLog.countDocuments(filter)
    ]);

    res.json({
      success: true,
      page,
      limit,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      hasNextPage: page * limit < totalRecords,
      hasPrevPage: page > 1,
      count: logs.length,
      logs
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMyCurrentMonthCallLogs = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 20, 1);
    const skip = (page - 1) * limit;

    // Current month start
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Next month start
    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    const filter = {
      userId: req.userId,
      createdAt: {
        $gte: startOfMonth,
        $lt: endOfMonth,
      },
    };

    // Get paginated logs
    const [logs, totalRecords] = await Promise.all([
      CallLog.find(filter)
        .populate("userId", "name phoneNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      CallLog.countDocuments(filter),
    ]);

    // Get current month summary
    const summaryResult = await CallLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.userId),
          createdAt: {
            $gte: startOfMonth,
            $lt: endOfMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalCalls: { $sum: 1 },
          totalMinutes: { $sum: "$billedMinutes" },
          totalCost: { $sum: "$callCost" },
        },
      },
    ]);

    const summary =
      summaryResult.length > 0
        ? {
            totalCalls: summaryResult[0].totalCalls,
            totalMinutes: summaryResult[0].totalMinutes,
            totalCost: Number(summaryResult[0].totalCost.toFixed(2)),
          }
        : {
            totalCalls: 0,
            totalMinutes: 0,
            totalCost: 0,
          };

    res.json({
      success: true,
      month: startOfMonth.toLocaleString("default", {
        month: "long",
        year: "numeric",
      }),
      summary,
      page,
      limit,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      hasNextPage: page * limit < totalRecords,
      hasPrevPage: page > 1,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error("Current Month Call Logs Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.getMyTodayCallLogs = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 20, 1);
    const skip = (page - 1) * limit;

    // Start of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Start of tomorrow
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const filter = {
      userId: req.userId,
      createdAt: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    };

    // Get paginated logs
    const [logs, totalRecords] = await Promise.all([
      CallLog.find(filter)
        .populate("userId", "name phoneNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      CallLog.countDocuments(filter),
    ]);

    // Get today's summary
    const summaryResult = await CallLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.userId),
          createdAt: {
            $gte: startOfDay,
            $lt: endOfDay,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalCalls: { $sum: 1 },
          totalMinutes: { $sum: "$billedMinutes" },
          totalCost: { $sum: "$callCost" },
        },
      },
    ]);

    const summary =
      summaryResult.length > 0
        ? {
            totalCalls: summaryResult[0].totalCalls,
            totalMinutes: summaryResult[0].totalMinutes,
            totalCost: Number(summaryResult[0].totalCost.toFixed(2)),
          }
        : {
            totalCalls: 0,
            totalMinutes: 0,
            totalCost: 0,
          };

    res.json({
      success: true,
      date: startOfDay.toISOString().split("T")[0], // e.g. 2026-07-18
      summary,
      page,
      limit,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      hasNextPage: page * limit < totalRecords,
      hasPrevPage: page > 1,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error("Today's Call Logs Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// GET BY ID
exports.getCallLogById =
  async (req, res) => {
    try {
      const log = await CallLog.findById(
  req.params.id
).populate(
  "userId",
  "name phoneNumber"
);

      if (!log) {
        return res.status(404).json({
          success: false,
          message:
            "Call log not found"
        });
      }

      res.json({
        success: true,
        log
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };


// UPDATE
exports.updateCallLog =
  async (req, res) => {
    try {

      const log =
        await CallLog.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true
          }
        );

      if (!log) {
        return res.status(404).json({
          success: false,
          message:
            "Call log not found"
        });
      }

      res.json({
        success: true,
        message:
          "Call log updated",
        log
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };


// DELETE
exports.deleteCallLog =
  async (req, res) => {
    try {

      const log =
        await CallLog.findByIdAndDelete(
          req.params.id
        );

      if (!log) {
        return res.status(404).json({
          success: false,
          message:
            "Call log not found"
        });
      }

      res.json({
        success: true,
        message:
          "Call log deleted"
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };