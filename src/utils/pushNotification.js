const admin = require("../config/firebase");

const sendPushNotification = async (
  token,
  title,
  body,
  data = {}
) => {
  try {
    if (!token) {
      console.log("FCM token not found.");
      return;
    }

    await admin.messaging().send({
      token,

      notification: {
        title,
        body,
      },

      data,

      android: {
        priority: "high",
      },

      apns: {
        payload: {
          aps: {
            sound: "default",
          },
        },
      },
    });

    console.log("Push notification sent.");
  } catch (err) {
    console.log("Push notification error:", err.message);
  }
};

module.exports = {
  sendPushNotification,
};