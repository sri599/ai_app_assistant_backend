const Invoice = require("../models/Invoice");
const CallLog = require("../models/CallLog");
const User = require("../models/User");
const { sendPushNotification } = require("../utils/pushNotification");
const { sendEmail } = require("../utils/email");

// Generate Invoice (Admin)
exports.generateInvoice = async (req, res) => {
  try {

    const userId = req.params.userId;

    const logs = await CallLog.find({
      userId,
      billed: false
    });

    if (!logs.length) {
      return res.status(400).json({
        success: false,
        message: "No calls available for billing"
      });
    }

    const totalCalls = logs.length;

    const billedMinutes = logs.reduce(
      (sum, log) => sum + (log.billedMinutes || 0),
      0
    );

    const totalAmount = logs.reduce(
      (sum, log) => sum + (log.callCost || 0),
      0
    );

    const invoice = await Invoice.create({

      invoiceNo: "INV-" + Date.now(),

      userId,

      billingCycle: "monthly",

      fromDate: logs[0].createdAt,

      toDate: new Date(),

      totalCalls,

      billedMinutes,

      totalAmount,

      currency: "INR",

      status: "Pending"

    });

    await CallLog.updateMany(
      {
        _id: {
          $in: logs.map(l => l._id)
        }
      },
      {
        $set: {
          billed: true
        }
      }
    );
    const user = await User.findById(userId);
    if (user?.fcmToken) {
  await sendPushNotification(
    user.fcmToken,
    "New Invoice Generated",
    `A new invoice of ₹${totalAmount.toFixed(2)} has been generated.`,
    {
      type: "invoice",
      invoiceId: invoice._id.toString(),
      invoiceNo: invoice.invoiceNo,
      amount: totalAmount.toFixed(2),
      status: invoice.status,
    }
  );
}
if (user?.email) {
  await sendEmail(
    user.email,
    "New Invoice Generated",
    `
      <h2>Invoice Generated</h2>

      <p>Hello ${user.name || "User"},</p>

      <p>Your invoice has been generated.</p>

      <table border="1" cellpadding="8" cellspacing="0">
        <tr>
          <td><b>Invoice No</b></td>
          <td>${invoice.invoiceNo}</td>
        </tr>

        <tr>
          <td><b>Total Calls</b></td>
          <td>${invoice.totalCalls}</td>
        </tr>

        <tr>
          <td><b>Billed Minutes</b></td>
          <td>${invoice.billedMinutes}</td>
        </tr>

        <tr>
          <td><b>Total Amount</b></td>
          <td>₹${invoice.totalAmount.toFixed(2)}</td>
        </tr>

        <tr>
          <td><b>Status</b></td>
          <td>${invoice.status}</td>
        </tr>
      </table>

      <p>Thank you,<br>Sharyx AI Assistant</p>
    `
  );
}
    res.status(201).json({
      success: true,
      message: "Invoice generated successfully",
      invoice
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


// Admin - All Invoices
exports.getAllInvoices = async (req, res) => {

  try {

    const invoices = await Invoice.find()
      .populate(
        "userId",
        "name phoneNumber aiNumber"
      )
      .sort({
        createdAt: -1
      });

    res.json({

      success: true,

      count: invoices.length,

      invoices

    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


// User - My Invoices
exports.getMyInvoices = async (req, res) => {

  try {

    const invoices = await Invoice.find({
      userId: req.userId
    }).sort({
      createdAt: -1
    });

    res.json({

      success: true,

      count: invoices.length,

      invoices

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

};


// Get Single Invoice
exports.getInvoiceById = async (req, res) => {

  try {

    const invoice = await Invoice.findById(
      req.params.id
    ).populate(
      "userId",
      "name phoneNumber aiNumber"
    );

    if (!invoice) {

      return res.status(404).json({

        success: false,

        message: "Invoice not found"

      });

    }

    res.json({

      success: true,

      invoice

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

};


// Admin - Mark Invoice Paid
exports.markInvoicePaid = async (req, res) => {

  try {

    const invoice = await Invoice.findById(
      req.params.id
    );

    if (!invoice) {

      return res.status(404).json({

        success: false,

        message: "Invoice not found"

      });

    }

    invoice.status = "Paid";

    invoice.paidAt = new Date();

    await invoice.save();

    res.json({

      success: true,

      message: "Invoice marked as Paid",

      invoice

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

};


// Admin - Cancel Invoice
exports.cancelInvoice = async (req, res) => {

  try {

    const invoice = await Invoice.findById(
      req.params.id
    );

    if (!invoice) {

      return res.status(404).json({

        success: false,

        message: "Invoice not found"

      });

    }

    invoice.status = "Cancelled";

    await invoice.save();

    res.json({

      success: true,

      message: "Invoice cancelled",

      invoice

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

};