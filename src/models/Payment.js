const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
{
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    aiNumberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AiNumber",
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: [
            "paid",
            "failed",
            "cancelled",
            "refunded"
        ],
        default: "failed"
    },

    paymentMethod: {
        type: String,
        default: "Razorpay"
    },

    razorpayOrderId: {
        type: String,
        default: null
    },

    razorpayPaymentId: {
        type: String,
        default: null,
        unique: true,
        sparse: true
    },

    razorpaySignature: {
        type: String,
        default: null
    },

    remarks: {
        type: String,
        default: ""
    }

},
{
    timestamps: true
});

module.exports = mongoose.model(
    "Payment",
    paymentSchema
);