const crypto=require("crypto");

const razorpay=require("../config/razorpay");

const Invoice=require("../models/Invoice");

const InvoiceSettlement=require("../models/InvoiceSettlement");
exports.createInvoiceOrder=async(req,res)=>{

try{

const invoiceId=req.body.invoiceId;

const invoice=await Invoice.findById(invoiceId);

if(!invoice){

return res.status(404).json({

success:false,

message:"Invoice not found"

});

}

if(invoice.status==="Paid"){

return res.status(400).json({

success:false,

message:"Invoice already paid"

});

}

const order=await razorpay.orders.create({

amount:invoice.totalAmount*100,

currency:invoice.currency,

receipt:invoice.invoiceNo,

notes:{

invoiceId:invoice._id.toString(),

userId:invoice.userId.toString()

}

});

await InvoiceSettlement.create({

invoiceId:invoice._id,

userId:invoice.userId,

amount:invoice.totalAmount,

status:"Pending",

razorpayOrderId:order.id

});

res.json({

success:true,

key:process.env.RAZORPAY_KEY_ID,

order,

invoice

});

}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};
exports.verifyInvoicePayment=async(req,res)=>{

try{

const{

invoiceId,

razorpay_order_id,

razorpay_payment_id,

razorpay_signature

}=req.body;

const body=

razorpay_order_id+"|"+razorpay_payment_id;

const expected=crypto

.createHmac(

"sha256",

process.env.RAZORPAY_KEY_SECRET

)

.update(body)

.digest("hex");

if(expected!==razorpay_signature){

return res.status(400).json({

success:false,

message:"Invalid Signature"

});

}

const settlement=

await InvoiceSettlement.findOne({

invoiceId,

razorpayOrderId:razorpay_order_id

});

if(!settlement){

return res.status(404).json({

success:false,

message:"Settlement not found"

});

}

settlement.status="Paid";

settlement.razorpayPaymentId=

razorpay_payment_id;

settlement.razorpaySignature=

razorpay_signature;

settlement.paidAt=new Date();

await settlement.save();

const invoice=

await Invoice.findById(invoiceId);

invoice.status="Paid";

await invoice.save();

res.json({

success:true,

message:"Invoice paid successfully",

invoice

});

}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};
exports.invoicePaymentFailed=async(req,res)=>{

try{

const{

invoiceId,

reason

}=req.body;

const settlement=

await InvoiceSettlement.findOne({

invoiceId

}).sort({

createdAt:-1

});

if(!settlement){

return res.status(404).json({

success:false,

message:"Settlement not found"

});

}

settlement.status="Failed";

settlement.remarks=

reason||"Payment Failed";

await settlement.save();

res.json({

success:true,

message:"Failure recorded"

});

}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};
exports.getMySettlements=async(req,res)=>{

try{

const list=

await InvoiceSettlement.find({

userId:req.userId

})

.populate("invoiceId")

.sort({

createdAt:-1

});

res.json({

success:true,

count:list.length,

settlements:list

});

}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};
exports.getAllSettlements=async(req,res)=>{

try{

const list=

await InvoiceSettlement.find()

.populate(

"userId",

"name phoneNumber"

)

.populate("invoiceId")

.sort({

createdAt:-1

});

res.json({

success:true,

count:list.length,

settlements:list

});

}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};