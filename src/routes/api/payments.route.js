const express = require("express");
const router = express.Router();
const paymentsController = require("../../controller/api/payments.controller");
const checkAuth = require("@/middlewares/checkAuth");

router.post("/:courseId", checkAuth, paymentsController.payment);
// Verify payment session
router.post("/verify/:sessionId", checkAuth, paymentsController.verifyPayment);
// stripe webhook (no auth)
router.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    paymentsController.webhook
);

module.exports = router;
