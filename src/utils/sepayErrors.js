/**
 * SEPAY ERROR HANDLING & EDGE CASES
 * Handles all error scenarios and edge cases in payment flow
 */

// Custom Error Classes
class SepayError extends Error {
    constructor(code, message, statusCode = 400, details = {}) {
        super(message);
        this.name = "SepayError";
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }
}

class QRExpiredError extends SepayError {
    constructor(expiresAt) {
        super(
            "QR_EXPIRED",
            "QR code has expired. Please create a new payment.",
            400,
            { expiresAt }
        );
        this.name = "QRExpiredError";
    }
}

class PaymentTimeoutError extends SepayError {
    constructor(duration) {
        super(
            "PAYMENT_TIMEOUT",
            "Payment confirmation timeout. Please check payment status manually.",
            408,
            { duration }
        );
        this.name = "PaymentTimeoutError";
    }
}

class DuplicatePaymentError extends SepayError {
    constructor(existingPaymentId) {
        super(
            "DUPLICATE_PAYMENT",
            "A payment for this course is already pending. Please complete or cancel existing payment.",
            409,
            { existingPaymentId }
        );
        this.name = "DuplicatePaymentError";
    }
}

class PaymentFailedError extends SepayError {
    constructor(sepayReason, sepayCode) {
        super("PAYMENT_FAILED", `Payment failed: ${sepayReason}`, 402, {
            sepayCode,
            sepayReason,
        });
        this.name = "PaymentFailedError";
    }
}

class NetworkError extends SepayError {
    constructor(originalError) {
        super(
            "NETWORK_ERROR",
            "Network error occurred. Please check your connection and try again.",
            503,
            { originalError: originalError?.message }
        );
        this.name = "NetworkError";
    }
}

// Error Response Handler
const errorResponses = {
    QR_EXPIRED: {
        userMessage: "QR mã đã hết hạn. Vui lòng tạo thanh toán mới.",
        userAction: "CREATE_NEW_QR",
        retryable: true,
        retryDelay: 0,
    },
    PAYMENT_TIMEOUT: {
        userMessage:
            "Timeout xác nhận thanh toán. Vui lòng kiểm tra trạng thái thủ công.",
        userAction: "MANUAL_CHECK",
        retryable: true,
        retryDelay: 3000,
    },
    DUPLICATE_PAYMENT: {
        userMessage:
            "Bạn đã có một thanh toán đang chờ. Vui lòng hoàn tất hoặc hủy thanh toán trước đó.",
        userAction: "SHOW_EXISTING",
        retryable: false,
    },
    PAYMENT_FAILED: {
        userMessage: "Thanh toán thất bại. Vui lòng thử lại.",
        userAction: "RETRY",
        retryable: true,
        retryDelay: 5000,
    },
    NETWORK_ERROR: {
        userMessage: "Lỗi mạng. Kiểm tra kết nối internet và thử lại.",
        userAction: "RETRY",
        retryable: true,
        retryDelay: 5000,
    },
    INVALID_SIGNATURE: {
        userMessage: "Lỗi xác thực bảo mật. Vui lòng thử lại.",
        userAction: "RETRY",
        retryable: true,
        retryDelay: 3000,
    },
    INVALID_REFERENCE_CODE: {
        userMessage: "Mã tham chiếu không hợp lệ.",
        userAction: "CREATE_NEW_QR",
        retryable: true,
        retryDelay: 0,
    },
    SEPAY_API_ERROR: {
        userMessage: "Lỗi từ dịch vụ thanh toán. Vui lòng thử lại sau.",
        userAction: "RETRY",
        retryable: true,
        retryDelay: 5000,
    },
    INVALID_PAYMENT_AMOUNT: {
        userMessage: "Số tiền không hợp lệ.",
        userAction: "RETRY",
        retryable: true,
        retryDelay: 0,
    },
    COURSE_NOT_FOUND: {
        userMessage: "Khoá học không tìm thấy.",
        userAction: "RELOAD",
        retryable: false,
    },
    USER_NOT_FOUND: {
        userMessage: "Người dùng không tìm thấy. Vui lòng đăng nhập lại.",
        userAction: "REDIRECT_LOGIN",
        retryable: false,
    },
    PAYMENT_NOT_FOUND: {
        userMessage: "Thanh toán không tìm thấy.",
        userAction: "CREATE_NEW_QR",
        retryable: true,
        retryDelay: 0,
    },
    INSUFFICIENT_DATA: {
        userMessage: "Dữ liệu không đủ. Vui lòng thử lại.",
        userAction: "RETRY",
        retryable: true,
        retryDelay: 2000,
    },
    SEPAY_RATE_LIMIT: {
        userMessage: "Quá nhiều yêu cầu. Vui lòng đợi và thử lại.",
        userAction: "WAIT_RETRY",
        retryable: true,
        retryDelay: 60000,
    },
};

// Edge Case Validators
const validators = {
    // Check if QR code has expired
    isQRExpired: (expiresAt) => {
        if (!expiresAt) return false;
        return new Date() > new Date(expiresAt);
    },

    // Check if payment has timed out (no update for 15+ minutes)
    isPaymentTimedOut: (createdAt, timeoutMinutes = 15) => {
        const createdTime = new Date(createdAt);
        const now = new Date();
        const minutesPassed = (now - createdTime) / (1000 * 60);
        return minutesPassed > timeoutMinutes;
    },

    // Check for duplicate pending payments
    hasDuplicatePayment: async (Payment, userId, courseId) => {
        try {
            const existing = await Payment.findOne({
                where: {
                    user_id: userId,
                    course_id: courseId,
                    status: ["pending", "processing"],
                },
            });
            return existing;
        } catch (error) {
            console.error("Error checking duplicate payments:", error);
            throw error;
        }
    },

    // Validate reference code format
    isValidReferenceCode: (refCode) => {
        // Format: SEPAY_[TIMESTAMP]_[USERID]_[COURSEID]_[RANDOM]
        const pattern = /^SEPAY_\d+_\d+_\d+_[A-Z0-9]{6}$/;
        return pattern.test(refCode);
    },

    // Validate payment amount
    isValidAmount: (amount) => {
        return amount && amount > 0 && amount <= 999999999;
    },

    // Check if user owns the payment
    isUserPaymentOwner: async (Payment, paymentId, userId) => {
        const payment = await Payment.findByPk(paymentId);
        if (!payment) return false;
        return payment.user_id === userId;
    },

    // Check if payment can be canceled
    canCancelPayment: (status) => {
        return ["pending", "processing"].includes(status);
    },

    // Check if payment is already completed
    isPaymentCompleted: (status) => {
        return ["completed", "succeeded"].includes(status);
    },
};

// Retry Logic with Exponential Backoff
class RetryManager {
    constructor(maxRetries = 3, baseDelay = 1000) {
        this.maxRetries = maxRetries;
        this.baseDelay = baseDelay;
    }

    calculateDelay(attemptNumber) {
        // Exponential backoff: 1s, 2s, 4s, 8s...
        return this.baseDelay * Math.pow(2, attemptNumber);
    }

    async executeWithRetry(fn, onRetry) {
        let lastError;

        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                const isRetryable =
                    error.code && errorResponses[error.code]?.retryable;

                if (attempt < this.maxRetries && isRetryable) {
                    const delay = this.calculateDelay(attempt);
                    console.log(
                        `Retry attempt ${attempt + 1}/${
                            this.maxRetries
                        } after ${delay}ms for ${error.code}`
                    );

                    if (onRetry) {
                        onRetry(attempt + 1, delay);
                    }

                    await new Promise((resolve) => setTimeout(resolve, delay));
                } else {
                    break;
                }
            }
        }

        throw lastError;
    }
}

// Webhook Duplicate Handler (Idempotency)
const webhookIdempotency = {
    // Store processed webhooks to prevent duplicate processing
    processedWebhooks: new Map(),

    generateWebhookKey: (transactionId, timestamp) => {
        return `${transactionId}_${timestamp}`;
    },

    isWebhookProcessed: (key) => {
        return webhookIdempotency.processedWebhooks.has(key);
    },

    markWebhookProcessed: (key, ttl = 3600000) => {
        // TTL: 1 hour (3600000 ms)
        webhookIdempotency.processedWebhooks.set(key, Date.now());

        // Clean up old entries periodically
        setTimeout(() => {
            webhookIdempotency.processedWebhooks.delete(key);
        }, ttl);
    },

    clearOldWebhooks: () => {
        const now = Date.now();
        const ttl = 3600000; // 1 hour

        for (const [key, timestamp] of webhookIdempotency.processedWebhooks) {
            if (now - timestamp > ttl) {
                webhookIdempotency.processedWebhooks.delete(key);
            }
        }
    },
};

// Error Logger
const errorLogger = {
    log: (error, context = {}) => {
        const errorData = {
            timestamp: new Date().toISOString(),
            name: error.name,
            code: error.code,
            message: error.message,
            statusCode: error.statusCode,
            details: error.details,
            context,
            stack: error.stack,
        };

        console.error("[SEPAY ERROR]", JSON.stringify(errorData, null, 2));

        // In production, you might want to send this to an error tracking service
        // like Sentry, Bugsnag, etc.
    },

    logWarning: (message, context = {}) => {
        const warningData = {
            timestamp: new Date().toISOString(),
            message,
            context,
        };

        console.warn("[SEPAY WARNING]", JSON.stringify(warningData, null, 2));
    },

    logInfo: (message, context = {}) => {
        const infoData = {
            timestamp: new Date().toISOString(),
            message,
            context,
        };

        console.log("[SEPAY INFO]", JSON.stringify(infoData, null, 2));
    },
};

module.exports = {
    // Error Classes
    SepayError,
    QRExpiredError,
    PaymentTimeoutError,
    DuplicatePaymentError,
    PaymentFailedError,
    NetworkError,

    // Response Handlers
    errorResponses,

    // Validators
    validators,

    // Retry Logic
    RetryManager,

    // Webhook Idempotency
    webhookIdempotency,

    // Error Logger
    errorLogger,
};
