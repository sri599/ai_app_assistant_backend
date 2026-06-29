const mongoose=require("mongoose");

const settlementSchema=new mongoose.Schema({

    invoiceId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Invoice"
    },

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    amount:Number,

    paymentMethod:String,

    transactionId:String,

    paidAt:{
        type:Date,
        default:Date.now
    }

},{timestamps:true});

module.exports=mongoose.model(
    "Settlement",
    settlementSchema
);