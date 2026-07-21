const express = require("express");

const router = express.Router();

const callLogController =
  require(
    "../controllers/callLogController"
  );
  const auth =
  require("../middleware/authMiddleware");
  router.get(
  "/my-calls",
  auth,
  callLogController.getMyCallLogs
);
router.get("/my-calls/billing", auth, callLogController.getMyBillingCallLogs);
router.get(
  "/admin/user/:userId",
  callLogController.getUserCallLogsForAdmin
);
router.get(
  "/my-calls/current-month",
  auth,
  callLogController.getMyCurrentMonthCallLogs
);
router.get(
  "/my-calls/today",
  auth,
  callLogController.getMyTodayCallLogs
);
router.post(
  "/",
  callLogController.createCallLog
);

router.get(
  "/",
  callLogController.getCallLogs
);

router.get(
  "/:id",
  callLogController.getCallLogById
);

router.put(
  "/:id",
  callLogController.updateCallLog
);

router.delete(
  "/:id",
  callLogController.deleteCallLog
);
router.get("/billing/:userId", callLogController.getBillingCallLogs);

module.exports = router;