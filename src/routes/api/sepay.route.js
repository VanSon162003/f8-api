const express = require("express");
const router = express.Router();
const sepayController = require("../../controller/api/sepay.controller");
const checkAuth = require("@/middlewares/checkAuth");

/**
 * POST /sepay/create
 * Tạo QR code thanh toán cho khóa học
 * Require: authentication
 */
router.post("/create", checkAuth, sepayController.createPayment);

/**
 * GET /sepay/status/:referenceCode
 * Kiểm tra trạng thái thanh toán từ Sepay
 * Require: authentication
 */
router.get(
    "/status/:referenceCode",
    checkAuth,
    sepayController.checkPaymentStatus
);

/**
 * GET /sepay/payment/:paymentId
 * Lấy chi tiết thanh toán từ database
 * Require: authentication
 */
router.get("/payment/:paymentId", checkAuth, sepayController.getPaymentDetail);

/**
 * POST /sepay/manual-check/:paymentId
 * Kiểm tra thủ công trạng thái thanh toán từ Sepay
 * Require: authentication
 */
router.post(
    "/manual-check/:paymentId",
    checkAuth,
    sepayController.manualCheckPayment
);

/**
 * POST /sepay/cancel/:paymentId
 * Huỷ bỏ thanh toán đang pending
 * Require: authentication
 */
router.post("/cancel/:paymentId", checkAuth, sepayController.cancelPayment);

/**
 * POST /sepay/webhook
 * Nhận webhook callback từ Sepay khi thanh toán hoàn thành
 * NO authentication required (webhook từ Sepay server)
 * Signature verification bằng HMAC-SHA256
 */
router.post("/webhook", sepayController.handleWebhook);

module.exports = router;
