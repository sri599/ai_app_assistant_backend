const plans = require("../data/plans");
const subscriptions = require("../data/subscriptions");
const users = require("../data/users");
exports.getPlans = async (req, res) => {
  try {
    res.json({
      success: true,
      plans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.activateSubscription = async (req, res) => {
  try {
    const { planId } = req.body;

    const plan = plans.find(
      (p) => p.id === Number(planId)
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      });
    }

    const startDate = new Date();

    const expiryDate = new Date();

    expiryDate.setDate(
      expiryDate.getDate() +
        plan.durationDays
    );

    const subscription = {
      id: Date.now().toString(),
      userId: req.userId,
      planId: plan.id,
      planName: plan.name,
      amount: plan.price,
      startDate,
      expiryDate,
      status: "active"
    };

    subscriptions.push(subscription);
    const user = users.find(
  (u) => u.id === req.userId
);

if (user) {
  user.subscriptionStatus = "active";

  user.subscription = {
    planId: plan.id,
    planName: plan.name,
    amount: plan.price,
    startDate,
    expiryDate,
    status: "active",
  };
}

    res.json({
      success: true,
      message:
        "Subscription activated",
      subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getCurrentSubscription =
  async (req, res) => {
    try {
      const subscription =
        subscriptions
          .filter(
            (s) =>
              s.userId === req.userId
          )
          .sort(
            (a, b) =>
              new Date(
                b.startDate
              ) -
              new Date(a.startDate)
          )[0];

      if (!subscription) {
        return res.json({
          success: true,
          subscription: null
        });
      }

      res.json({
        success: true,
        subscription
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

exports.subscriptionHistory =
  async (req, res) => {
    try {
      const history =
        subscriptions.filter(
          (s) =>
            s.userId === req.userId
        );

      res.json({
        success: true,
        history
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };