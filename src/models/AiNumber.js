const mongoose =
  require("mongoose");

const aiNumberSchema =
  new mongoose.Schema(
    {
      phoneNumber: {
        type: String,
        required: true,
        unique: true
      },
      price: {
  type: Number,
  default: 0
},

      status: {
        type: String,
        enum: [
          "free",
          "assigned"
        ],
        default: "free"
      },

      assignedTo: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "User",
        default: null
      }
    },
    {
      timestamps: true
    }
  );

module.exports =
  mongoose.model(
    "AiNumber",
    aiNumberSchema
  );