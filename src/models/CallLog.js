const mongoose = require("mongoose");

const CallLogSchema = new mongoose.Schema(
  {
    isTestCall: {
  type: Boolean,
  default: false
},
 billingRate: {
    type: Number,
    default: 0
},

billedMinutes: {
    type: Number,
    default: 0
},

callCost: {
    type: Number,
    default: 0
},

billed: {
    type: Boolean,
    default: false
},

invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoice",
    default: null
},
    userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null
},
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
CallLogSchema.index({
    userId: 1,
    createdAt: -1
});

CallLogSchema.index({
    call_id: 1
});

CallLogSchema.index({
    createdAt: -1
});

module.exports = mongoose.model(
  "CallLog",
  CallLogSchema
);