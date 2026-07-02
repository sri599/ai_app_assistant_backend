const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    phoneNumber: {
      type: String,
      required: true,
      unique: true
    },
    email: {
  type: String,
  default: null,
  trim: true,
  lowercase: true
},

    password: {
      type: String,
      required: true
    },
    fcmToken: {
  type: String,
  default: null
},

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    aiNumber: {
      type: String,
      default: null
    },

    subscriptionStatus: {
      type: String,
      default: "inactive"
    },

    subscription: {
      type: Object,
      default: null
    },
    isDeleted: {
  type: Boolean,
  default: false
},

deletedAt: {
  type: Date,
  default: null
}
  },
  {
    timestamps: true
  }
);

module.exports =
  mongoose.model("User", userSchema);