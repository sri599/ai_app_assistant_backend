const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Payment = require("../models/Payment");
const subscriptions = require("../data/subscriptions");
 const AiNumber =
  require("../models/AiNumber");

  exports.deleteAiNumber = async (req, res) => {
  try {
    const number = await AiNumber.findByIdAndDelete(req.params.id);

    if (!number) {
      return res.status(404).json({
        success: false,
        message: "AI Number not found"
      });
    }

    res.json({
      success: true,
      message: "Deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
  exports.getAiNumbers =
  async (req, res) => {

    const numbers =
      await AiNumber.find()
        .populate(
          "assignedTo",
          "name phoneNumber"
        );

    res.json({
      success: true,
      numbers
    });
  };
  exports.deleteUser = async (
  req,
  res
) => {
  try {

    const user =
      await User.findOne({
        _id: req.params.id,
        role: "user"
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.isDeleted = true;
    user.deletedAt = new Date();

    await user.save();

    res.json({
      success: true,
      message:
        "User deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await User.findOne({
      _id: req.params.id,
      role: "admin"
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    admin.isDeleted = true;
    admin.deletedAt = new Date();

    await admin.save();

    res.json({
      success: true,
      message: "Admin deleted"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.restoreUser = async (
  req,
  res
) => {
  try {

    const user =
      await User.findById(
        req.params.id
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.isDeleted = false;
    user.deletedAt = null;

    await user.save();

    res.json({
      success: true,
      message:
        "Restored successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.getDeletedUsers =
  async (req, res) => {

    const users =
      await User.find({
        isDeleted: true
      }).select(
        "-password"
      );

    res.json({
      success: true,
      users
    });
  };
exports.dashboard = async (req, res) => {
  try {

    const totalUsers =
      await User.countDocuments({
        role: "user",
        isDeleted: false
      });

    const totalAdmins =
      await User.countDocuments({
        role: "admin",
        isDeleted: false
      });

    const totalAiNumbers =
      await AiNumber.countDocuments();

    const assignedNumbers =
      await AiNumber.countDocuments({
        status: "assigned"
      });

    const freeNumbers =
      await AiNumber.countDocuments({
        status: "free"
      });

    const activeSubscriptions =
      await User.countDocuments({
        subscriptionStatus: "active"
      });
      const totalPayments =
  await Payment.countDocuments();

const successfulPayments =
  await Payment.countDocuments({
    status: "paid"
  });

const failedPayments =
  await Payment.countDocuments({
    status: "failed"
  });

const cancelledPayments =
  await Payment.countDocuments({
    status: "cancelled"
  });

const revenue =
  await Payment.aggregate([
    {
      $match: {
        status: "paid"
      }
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: "$amount"
        }
      }
    }
  ]);

    res.json({

  success:true,

  totalUsers,
  totalAdmins,

  totalAiNumbers,
  assignedNumbers,
  freeNumbers,

  activeSubscriptions,

  totalPayments,

  successfulPayments,

  failedPayments,

  cancelledPayments,

  totalRevenue:
    revenue.length
      ? revenue[0].total
      : 0

});

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.getAllPayments = async (req,res)=>{

try{

const payments =
await Payment.find()

.populate(
"userId",
"name phoneNumber"
)

.populate(
"aiNumberId",
"phoneNumber price"
)

.sort({
createdAt:-1
});

res.json({

success:true,

count:payments.length,

payments

});

}
catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};
exports.getPaymentById = async (req,res)=>{

try{

const payment =
await Payment.findById(req.params.id)

.populate(
"userId",
"name phoneNumber"
)

.populate(
"aiNumberId",
"phoneNumber price"
);

if(!payment){

return res.status(404).json({

success:false,

message:"Payment not found"

});

}

res.json({

success:true,

payment

});

}
catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};
exports.getPaymentsByUser = async(req,res)=>{

try{

const payments=
await Payment.find({

userId:req.params.userId

})

.populate(

"aiNumberId",

"phoneNumber price"

)

.sort({

createdAt:-1

});

res.json({

success:true,

count:payments.length,

payments

});

}
catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};
exports.updatePaymentStatus = async(req,res)=>{

try{

const payment =
await Payment.findById(req.params.id);

if(!payment){

return res.status(404).json({

success:false,

message:"Payment not found"

});

}

payment.status=req.body.status;

await payment.save();

res.json({

success:true,

message:"Status updated",

payment

});

}
catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};
exports.deletePayment = async(req,res)=>{

try{

const payment =
await Payment.findByIdAndDelete(
req.params.id
);

if(!payment){

return res.status(404).json({

success:false,

message:"Payment not found"

});

}

res.json({

success:true,

message:"Payment deleted"

});

}
catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};

exports.getUsers = async (
  req,
  res
) => {
  try {

    const users =
      await User.find({
        role: "user",
        isDeleted: false
      }).select(
        "-password"
      );

    res.json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error.message
    });
  }
};
exports.getUserById =
  async (req, res) => {
    try {

      const user =
        await User.findById(
          req.params.id
        ).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found"
        });
      }

      res.json({
        success: true,
        user
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };
exports.assignAiNumber = async (req, res) => {
  try {

    const { userId, aiNumber } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const number = await AiNumber.findOne({
      phoneNumber: aiNumber
    });

    if (!number) {
      return res.status(404).json({
        success: false,
        message: "AI Number not found"
      });
    }

    if (number.status === "assigned") {
      return res.status(400).json({
        success: false,
        message: "AI Number already assigned"
      });
    }

    // Release old number if user already has one
    if (user.aiNumber) {
      const oldNumber = await AiNumber.findOne({
        phoneNumber: user.aiNumber
      });

      if (oldNumber) {
        oldNumber.status = "free";
        oldNumber.assignedTo = null;
        await oldNumber.save();
      }
    }

    user.aiNumber = number.phoneNumber;
    await user.save();

    number.status = "assigned";
    number.assignedTo = user._id;
    await number.save();

    res.json({
      success: true,
      message: "AI Number assigned successfully",
      aiNumber: number.phoneNumber
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.createAdmin = async (
  req,
  res
) => {
  try {

    const {
      name,
      phoneNumber,
      password
    } = req.body;

    const existingUser =
      await User.findOne({
        phoneNumber
      });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "User already exists"
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const admin = new User({
      name,
      phoneNumber,
      password:
        hashedPassword,
      role: "admin"
    });

    await admin.save();

    res.json({
      success: true,
      message:
        "Admin created",
      admin
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error.message
    });
  }
};

exports.getAdmins =
  async (req, res) => {
    try {

      const admins =
        await User.find({
          role: "admin",
          isDeleted: false
        }).select(
          "-password"
        );

      res.json({
        success: true,
        count: admins.length,
        admins
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };

 

exports.addAiNumber =
  async (req, res) => {
    try {

      const {
  phoneNumber,
  price
} = req.body;

      const existing =
        await AiNumber.findOne({
          phoneNumber
        });

      if (existing) {
        return res.status(400).json({
          success: false,
          message:
            "Number already exists"
        });
      }

        const number =
  await AiNumber.create({
    phoneNumber,
    price
  });

      res.json({
        success: true,
        number
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };
  exports.updateAiNumberPrice = async (req, res) => {
  try {

    const { price } = req.body;

    const number = await AiNumber.findById(req.params.id);

    if (!number) {
      return res.status(404).json({
        success: false,
        message: "AI Number not found"
      });
    }

    number.price = price;

    await number.save();

    res.json({
      success: true,
      message: "Price updated successfully",
      number
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
  exports.makeAiNumberFree = async (req, res) => {
  try {
    const number = await AiNumber.findById(req.params.id);

    if (!number) {
      return res.status(404).json({
        success: false,
        message: "AI Number not found"
      });
    }

    // also remove from user if assigned
    if (number.assignedTo) {
      const user = await User.findById(number.assignedTo);

      if (user) {
        user.aiNumber = null;
        await user.save();
      }
    }

    number.status = "free";
    number.assignedTo = null;

    await number.save();

    res.json({
      success: true,
      message: "AI Number set to FREE"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.makeAiNumberFree = async (req, res) => {
  try {
    const number = await AiNumber.findById(req.params.id);

    if (!number) {
      return res.status(404).json({
        success: false,
        message: "AI Number not found"
      });
    }

    if (number.assignedTo) {
      const user = await User.findById(number.assignedTo);

      if (user) {
        user.aiNumber = null;
        await user.save();
      }
    }

    number.status = "free";
    number.assignedTo = null;

    await number.save();

    res.json({
      success: true,
      message: "AI Number made free successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.swapAiNumbers = async (req, res) => {
  try {

    const { userId1, userId2 } = req.body;

    const user1 = await User.findById(userId1);
    const user2 = await User.findById(userId2);

    if (!user1 || !user2) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const user1Number = user1.aiNumber;
    const user2Number = user2.aiNumber;

    user1.aiNumber = user2Number;
    user2.aiNumber = user1Number;

    await user1.save();
    await user2.save();

    if (user1Number) {
      const ai1 = await AiNumber.findOne({
        phoneNumber: user1Number
      });

      if (ai1) {
        ai1.assignedTo = user2._id;
        await ai1.save();
      }
    }

    if (user2Number) {
      const ai2 = await AiNumber.findOne({
        phoneNumber: user2Number
      });

      if (ai2) {
        ai2.assignedTo = user1._id;
        await ai2.save();
      }
    }

    res.json({
      success: true,
      message: "AI Numbers swapped successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};