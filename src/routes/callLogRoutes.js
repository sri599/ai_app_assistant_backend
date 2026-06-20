const express = require("express");

const router = express.Router();

const callLogController =
  require(
    "../controllers/callLogController"
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

module.exports = router;