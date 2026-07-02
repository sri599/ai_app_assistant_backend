const { messaging } = require("../config/firebase");

const sendPushNotification = async (token, title, body, data = {}) => {
  try {
    if (!token) return;

    await messaging.send({
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
    console.error("Push notification error:", err);
  }
};

module.exports = { sendPushNotification };