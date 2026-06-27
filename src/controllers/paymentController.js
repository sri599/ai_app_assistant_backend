const crypto=require("crypto");

const razorpay=require("../config/razorpay");

const Payment=require("../models/Payment");

const AiNumber=require("../models/AiNumber");

const User=require("../models/User");
exports.createOrder = async (req, res) => {
  try {

    const { aiNumberId } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.aiNumber) {
      return res.status(400).json({
        success: false,
        message: "You already own an AI Number"
      });
    }

    const number = await AiNumber.findById(aiNumberId);

    if (!number) {
      return res.status(404).json({
        success: false,
        message: "AI Number not found"
      });
    }

    if (number.status !== "free") {
      return res.status(400).json({
        success: false,
        message: "AI Number already assigned"
      });
    }

    if (number.price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price not configured"
      });
    }

    const order = await razorpay.orders.create({
      amount: number.price * 100,
      currency: "INR",
      receipt: `AIN-${Date.now()}`,
      notes: {
        userId: user._id.toString(),
        aiNumberId: number._id.toString(),
        phoneNumber: number.phoneNumber
      }
    });

    res.json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      order,
      aiNumber: number
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};
exports.verifyPayment = async (req, res) => {

  try {

    const {

      aiNumberId,

      razorpay_order_id,

      razorpay_payment_id,

      razorpay_signature

    } = req.body;

    const body =
      razorpay_order_id + "|" + razorpay_payment_id;

    const expected = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid Razorpay Signature"
      });
    }

    const existingPayment =
      await Payment.findOne({
        razorpayPaymentId: razorpay_payment_id
      });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Payment already verified"
      });
    }

    const user =
      await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.aiNumber) {
      return res.status(400).json({
        success: false,
        message: "User already owns an AI Number"
      });
    }

    const number =
      await AiNumber.findById(aiNumberId);

    if (!number) {
      return res.status(404).json({
        success: false,
        message: "AI Number not found"
      });
    }

    if (number.status !== "free") {
      return res.status(400).json({
        success: false,
        message: "AI Number is no longer available"
      });
    }

    await Payment.create({

      userId: user._id,

      aiNumberId: number._id,

      amount: number.price,

      paymentMethod: "Razorpay",

      status: "paid",

      razorpayOrderId: razorpay_order_id,

      razorpayPaymentId: razorpay_payment_id,

      razorpaySignature: razorpay_signature,

      remarks: "Payment Successful"

    });

    user.aiNumber = number.phoneNumber;
    await user.save();

    number.status = "assigned";
    number.assignedTo = user._id;
    await number.save();

    res.json({

      success: true,

      message: "Payment verified successfully",

      aiNumber: number.phoneNumber

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

};
exports.paymentFailed = async (req, res) => {

  try {

    const {

      aiNumberId,

      status,

      razorpayOrderId,

      reason

    } = req.body;

    const number =
      await AiNumber.findById(aiNumberId);

    if (!number) {

      return res.status(404).json({

        success: false,

        message: "AI Number not found"

      });

    }

    await Payment.create({

      userId: req.userId,

      aiNumberId: number._id,

      amount: number.price,

      paymentMethod: "Razorpay",

      status: status || "failed",

      razorpayOrderId,

      remarks:
        reason || "Payment Failed"

    });

    res.json({

      success: true,

      message:
        "Payment failure recorded"

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

};