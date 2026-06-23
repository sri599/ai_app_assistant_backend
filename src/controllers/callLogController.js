const CallLog = require("../models/CallLog");


// CREATE
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

    const callLog =
      await CallLog.create({

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

        callDuration:
          parseFloat(
            call.duration_seconds || 0
          ),

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

        StatusId: null
      });

    res.status(201).json({
      success: true,
      message:
        "Call log created successfully",
      callLog
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// GET ALL
exports.getCallLogs = async (
  req,
  res
) => {
  try {

    const logs =
      await CallLog.find()
        .sort({
          createdAt: -1
        });

    res.json({
      success: true,
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


// GET BY ID
exports.getCallLogById =
  async (req, res) => {
    try {

      const log =
        await CallLog.findById(
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