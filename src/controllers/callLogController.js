const CallLog = require("../models/CallLog");


// CREATE
exports.createCallLog = async (
  req,
  res
) => {
  try {
    const callLog =
      await CallLog.create(req.body);

    res.status(201).json({
      success: true,
      message:
        "Call log created successfully",
      callLog
    });

  } catch (error) {
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