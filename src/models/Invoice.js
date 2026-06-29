const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({

    invoiceNo:{
        type:String,
        unique:true
    },

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    billingCycle:String,

    fromDate:Date,

    toDate:Date,

    totalCalls:Number,

    billedMinutes:Number,

    totalAmount:Number,

    currency:{
        type:String,
        default:"INR"
    },

    status:{
        type:String,
        enum:["Pending","Paid","Cancelled"],
        default:"Pending"
    },

    generatedAt:{
        type:Date,
        default:Date.now
    }

},{timestamps:true});

module.exports=mongoose.model("Invoice",invoiceSchema);