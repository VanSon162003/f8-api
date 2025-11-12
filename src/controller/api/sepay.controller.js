const sepayService = require("@services/api/sepay.service");
const response = require("@/utils/response");
const { Payment } = require("@models");
const {
    DuplicatePaymentError,
    QRExpiredError,
    PaymentTimeoutError,
    PaymentFailedError,
    NetworkError,
    errorResponses,
    errorLogger,
} = require("@utils/sepayErrors");

/**
 * POST /sepay/create
 * Create QR code for payment
 * Body: { courseId }
 * Response: { success, data: { qrCode, referenceCode, amount, expiresAt } }
 */
const createPayment = async (req, res) => {
    try {
        const { courseId } = req.body;
        console.log(123);

        // Validation
        if (!courseId) {
            return response.error(res, 400, "Missing courseId");
        }

        if (!req.user || !req.user.id) {
            return response.error(res, 401, "Unauthorized");
        }

        errorLogger.logInfo("Payment creation requested", {
            userId: req.user.id,
            courseId,
        });

        // Validate payment can be created
        const validation = await sepayService.validatePaymentCreation(
            req.user,
            courseId
        );

        if (!validation.valid) {
            const errorInfo = validation.error;
            const errorConfig = errorResponses[errorInfo.code] || {};

            return response.error(res, 409, errorInfo.message, {
                code: errorInfo.code,
                userAction: errorConfig.userAction,
                retryable: errorConfig.retryable,
                existingPaymentId: errorInfo.existingPaymentId,
            });
        }

        // Create transaction with QR code
        const transaction = await sepayService.createTransaction(
            req.user,
            courseId
        );

        if (!transaction) {
            return response.error(res, 500, "Failed to create transaction");
        }

        return response.success(res, 200, {
            success: true,
            data: {
                paymentId: transaction.id,
                qrCode: transaction.qr_code,
                referenceCode: transaction.reference_code,
                amount: transaction.amount,
                courseId: transaction.course_id,
                expiresAt: transaction.expires_at,
                status: transaction.status,
            },
        });
    } catch (error) {
        errorLogger.log(error, { endpoint: "/sepay/create" });

        // Handle specific error types
        if (error instanceof DuplicatePaymentError) {
            return response.error(res, 409, error.message, {
                code: error.code,
                userAction: errorResponses[error.code].userAction,
                existingPaymentId: error.details.existingPaymentId,
            });
        }

        if (error instanceof NetworkError) {
            return response.error(res, 503, error.message, {
                code: error.code,
                retryable: true,
            });
        }

        return response.error(
            res,
            500,
            error.message || "Failed to create payment",
            { code: error.code }
        );
    }
};

/**
 * GET /sepay/status/:referenceCode
 * Check payment status
 * Params: referenceCode
 * Response: { success, data: { status, amount, transactionDate, message } }
 */
const checkPaymentStatus = async (req, res) => {
    try {
        const { referenceCode } = req.params;

        // Validation
        if (!referenceCode) {
            return response.error(res, 400, "Missing referenceCode");
        }

        errorLogger.logInfo("Payment status check requested", {
            referenceCode,
        });

        // Get transaction status from Sepay
        const transactionStatus = await sepayService.getTransactionStatus(
            referenceCode
        );

        if (!transactionStatus) {
            return response.error(res, 404, "Transaction not found");
        }

        return response.success(res, 200, transactionStatus);
    } catch (error) {
        return response.error(
            res,
            500,
            error.message || "Failed to check payment status",
            { code: error.code }
        );
    }
};

/**
 * GET /sepay/payment/:paymentId
 * Get payment details from database
 * Params: paymentId
 * Response: { success, data: { id, courseId, amount, status, qrCode, referenceCode, createdAt, expiresAt } }
 */
const getPaymentDetail = async (req, res) => {
    try {
        const { paymentId } = req.params;

        // Validation
        if (!paymentId) {
            return response.error(res, 400, "Missing paymentId");
        }

        const payment = await Payment.findByPk(paymentId);

        if (!payment) {
            return response.error(res, 404, "Payment not found");
        }

        // Verify user owns this payment
        if (payment.user_id !== req.user.id) {
            return response.error(res, 403, "Unauthorized");
        }

        // Check if QR has expired
        const isExpired = sepayService.validators.isQRExpired(
            payment.expires_at
        );

        return response.success(res, 200, {
            success: true,
            data: {
                id: payment.id,
                courseId: payment.course_id,
                userId: payment.user_id,
                amount: payment.amount,
                status: payment.status,
                isExpired,
                qrCode: payment.qr_code,
                referenceCode: payment.reference_code,
                orderCode: payment.order_code,
                createdAt: payment.createdAt,
                expiresAt: payment.expires_at,
                updatedAt: payment.updatedAt,
            },
        });
    } catch (error) {
        errorLogger.log(error, { endpoint: "/sepay/payment/:paymentId" });

        return response.error(
            res,
            500,
            error.message || "Failed to get payment detail",
            { code: error.code }
        );
    }
};

/**
 * POST /sepay/webhook
 * Receive webhook callback from Sepay when payment completes
 * Body: { referenceCode, status, amount, transactionDate, signature }
 * Response: { received: true }
 */
const handleWebhook = async (req, res) => {
    try {
        const { authorization } = req.headers;
        const signature = authorization.split(" ")[1];
        const payload = req.body;

        errorLogger.logInfo("Webhook received", {
            referenceCode: payload.referenceCode,
            status: payload.status,
            amount: payload.amount,
        });

        // Verify webhook signature
        const isValid = sepayService.verifyWebhookSignature(payload, signature);

        if (!isValid) {
            errorLogger.logWarning("Webhook signature verification failed", {
                referenceCode: payload.referenceCode,
            });

            // Still return received: true to prevent retry from Sepay
            return res.json({ received: true });
        }

        // Process webhook callback
        const result = await sepayService.handleWebhookCallback(payload);

        if (!result) {
            errorLogger.logWarning("Failed to process webhook", {
                referenceCode: payload.referenceCode,
            });

            // Still return received: true to prevent retry from Sepay
            return res.json({ received: true });
        }

        if (result.success) {
            errorLogger.logInfo("Webhook processed successfully", {
                referenceCode: payload.referenceCode,
                paymentId: result.payment?.id,
            });
        }

        // Sepay expects { received: true } response
        return res.json({ received: true });
    } catch (error) {
        errorLogger.log(error, { endpoint: "/sepay/webhook" });

        // Always return received: true to Sepay to avoid retry
        // Error logging is done above for debugging
        return res.json({ received: true });
    }
};

/**
 * POST /sepay/manual-check/:paymentId
 * Manually check payment status from Sepay
 * Use when webhook fails or user wants to verify
 * Params: paymentId
 * Response: { success, data: { status, message } }
 */
const manualCheckPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;

        // Validation
        if (!paymentId) {
            return response.error(res, 400, "Missing paymentId");
        }

        // Find payment record
        const payment = await Payment.findByPk(paymentId);

        if (!payment) {
            return response.error(res, 404, "Payment not found");
        }

        // Verify user owns this payment
        if (payment.user_id !== req.user.id) {
            return response.error(res, 403, "Unauthorized");
        }

        errorLogger.logInfo("Manual payment check requested", {
            paymentId,
            referenceCode: payment.reference_code,
        });

        // Check and update payment status
        const result = await sepayService.checkAndUpdatePaymentStatus(
            paymentId
        );

        return response.success(res, 200, {
            success: true,
            data: {
                paymentId,
                status: result.status,
                message: result.message,
            },
        });
    } catch (error) {
        errorLogger.log(error, { endpoint: "/sepay/manual-check/:paymentId" });

        // Handle specific error types
        if (error instanceof QRExpiredError) {
            return response.error(res, 410, error.message, {
                code: error.code,
                userAction: errorResponses[error.code].userAction,
                expiresAt: error.details.expiresAt,
            });
        }

        if (error instanceof PaymentTimeoutError) {
            return response.error(res, 408, error.message, {
                code: error.code,
                userAction: errorResponses[error.code].userAction,
                duration: error.details.duration,
            });
        }

        if (error instanceof PaymentFailedError) {
            return response.error(res, 402, error.message, {
                code: error.code,
                userAction: errorResponses[error.code].userAction,
                sepayCode: error.details.sepayCode,
                sepayReason: error.details.sepayReason,
            });
        }

        if (error instanceof NetworkError) {
            return response.error(res, 503, error.message, {
                code: error.code,
                retryable: true,
            });
        }

        return response.error(
            res,
            500,
            error.message || "Failed to check payment",
            { code: error.code }
        );
    }
};

/**
 * POST /sepay/cancel/:paymentId
 * Cancel pending payment
 * Body: none
 * Response: { success, message }
 */
const cancelPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;

        if (!req.user || !req.user.id) {
            return response.error(res, 401, "Unauthorized");
        }

        errorLogger.logInfo("Payment cancellation requested", {
            userId: req.user.id,
            paymentId,
        });

        const result = await sepayService.cancelPayment(paymentId, req.user);

        return response.success(res, 200, result.message, result);
    } catch (error) {
        errorLogger.log(error, { step: "cancelPayment" });

        if (error.code === "PAYMENT_NOT_FOUND") {
            return response.error(res, 404, error.message, {
                code: error.code,
            });
        }

        if (error.code === "UNAUTHORIZED") {
            return response.error(res, 403, error.message, {
                code: error.code,
            });
        }

        if (error.code === "INVALID_PAYMENT_STATUS") {
            return response.error(res, 400, error.message, {
                code: error.code,
            });
        }

        return response.error(
            res,
            500,
            error.message || "Failed to cancel payment",
            { code: error.code }
        );
    }
};

module.exports = {
    createPayment,
    checkPaymentStatus,
    getPaymentDetail,
    handleWebhook,
    manualCheckPayment,
    cancelPayment,
};
