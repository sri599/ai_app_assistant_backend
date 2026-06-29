const mongoose = require("mongoose");

const invoiceSettlementSchema = new mongoose.Schema(
{
    invoiceId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Invoice",
        required:true
    },

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    amount:{
        type:Number,
        required:true
    },

    paymentMethod:{
        type:String,
        default:"Razorpay"
    },

    status:{
        type:String,
        enum:[
            "Pending",
            "Paid",
            "Failed"
        ],
        default:"Pending"
    },

    razorpayOrderId:String,

    razorpayPaymentId:String,

    razorpaySignature:String,

    paidAt:Date,

    remarks:String

},
{
    timestamps:true
});

module.exports=mongoose.model(
    "InvoiceSettlement",
    invoiceSettlementSchema
);