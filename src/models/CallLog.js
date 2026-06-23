const mongoose = require("mongoose");

const CallLogSchema = new mongoose.Schema(
  {
    summary: {
      type: String,
      default: ""
    },

    outcome: {
      type: String,
      default: ""
    },

    fromNumber: {
  type: String,
  default: null
},

toNumber: {
  type: String,
  default: null
},

    callDuration: {
      type: Number,
      default: 0
    },

    callRecordingURL: {
      type: String,
      default: null
    },

    callEndReason: {
      type: String,
      default: ""
    },

    agentId: {
      type: String,
      default: ""
    },

    timeStamp: {
      type: Date,
      default: Date.now
    },

    callType: {
      type: String,
      enum: ["inbound", "outbound"],
      default: "outbound"
    },

    taskId: {
      type: String,
      default: ""
    },

    attempt: {
      type: Number,
      default: 1
    },

    call_id: {
      type: String,
      unique: true
    },

    turns: {
      type: Number,
      default: 0
    },

    name: {
      type: String,
      default: null
    },

    LeadCode: {
      type: String,
      default: null
    },

    StatusId: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "CallLog",
  CallLogSchema
);