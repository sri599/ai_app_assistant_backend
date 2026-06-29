const express=require("express");

const router=express.Router();

const auth=require("../middleware/authMiddleware");

const settlementController=require("../controllers/invoiceSettlementController");

router.post(

"/create-order",

auth,

settlementController.createInvoiceOrder

);

router.post(

"/verify",

auth,

settlementController.verifyInvoicePayment

);

router.post(

"/failed",

auth,

settlementController.invoicePaymentFailed

);

router.get(

"/my",

auth,

settlementController.getMySettlements

);

router.get(

"/all",

auth,

settlementController.getAllSettlements

);

module.exports=router;