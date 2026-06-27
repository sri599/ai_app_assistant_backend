const mongoose = require("mongoose");

const billingSettingSchema = new mongoose.Schema(
{
    pricePerMinute:{
        type:Number,
        default:0.80
    },

    billingCycle:{
        type:String,
        enum:[
            "daily",
            "weekly",
            "monthly",
            "yearly"
        ],
        default:"monthly"
    },

    currency:{
        type:String,
        default:"INR"
    }
},
{
    timestamps:true
});

module.exports = mongoose.model(
    "BillingSetting",
    billingSettingSchema
);