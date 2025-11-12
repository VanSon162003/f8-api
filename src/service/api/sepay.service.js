const axios = require("axios");
const crypto = require("crypto");
const { Payment, Course, User, UserCourse } = require("@models");
const {
    DuplicatePaymentError,
    QRExpiredError,
    PaymentTimeoutError,
    PaymentFailedError,
    NetworkError,
    validators,
    RetryManager,
    webhookIdempotency,
    errorLogger,
    errorResponses,
} = require("@utils/sepayErrors");

// Sepay Configuration
const SEPAY_API_URL =
    process.env.SEPAY_API_URL || "https://sandbox.sepay.vn/api";
const SEPAY_API_KEY = process.env.SEPAY_API_KEY || "";
let accessTokenCache = {
    token: null,
    expiresAt: null,
};

// Retry manager for API calls
const retryManager = new RetryManager(3, 1000);

/**
 * Get access token from Sepay API
 * @returns {Promise<string>} Access token
 */
const getAccessToken = async () => {
    try {
        // Return cached token if still valid
        if (accessTokenCache.token && accessTokenCache.expiresAt > Date.now()) {
            return accessTokenCache.token;
        }

        // For development, use API key directly
        const token = SEPAY_API_KEY;

        if (!token) {
            const error = new Error(
                "SEPAY_API_KEY not configured in environment"
            );
            error.code = "MISSING_API_KEY";
            throw error;
        }

        // Cache token (expires in 1 hour)
        accessTokenCache = {
            token,
            expiresAt: Date.now() + 3600000,
        };

        errorLogger.logInfo("Access token retrieved successfully");
        return token;
    } catch (error) {
        errorLogger.log(error, { step: "getAccessToken" });
        throw error;
    }
};

/**
 * Generate QR code for payment
 * Format: https://qr.sepay.vn/img?acc=ACCOUNT&bank=BANK&amount=AMOUNT&des=COURSE_ID
 * @param {number} amount - Amount in VND
 * @param {string} description - Payment description
 * @param {string} referenceCode - Order/transaction reference
 * @param {number} courseId - Course ID
 * @returns {Promise<{qrCode, qrDataURL, referenceCode}>}
 */
const generateQRCode = async (amount, description, referenceCode, courseId) => {
    try {
        // Validate amount
        if (!validators.isValidAmount(amount)) {
            const error = new Error("Invalid payment amount");
            error.code = "INVALID_PAYMENT_AMOUNT";
            throw error;
        }

        // Get Sepay account info from env
        const accountNumber =
            process.env.SEPAY_ACCOUNT_NUMBER || "VQRQAFFTL0100";
        const bankCode = process.env.SEPAY_BANK_CODE || "MBBank";

        // Build QR URL with amount and course ID
        // Format: https://qr.sepay.vn/img?acc=ACCOUNT&bank=BANK&amount=AMOUNT&des=COURSE_ID
        const qrUrl = `https://qr.sepay.vn/img?acc=${accountNumber}&bank=${bankCode}&amount=${Math.ceil(
            amount
        )}&des=DH${courseId}`;

        errorLogger.logInfo("QR code generated successfully", {
            referenceCode,
            amount,
            courseId,
            qrUrl,
        });

        return {
            qrCode: qrUrl,
            qrDataURL: qrUrl,
            referenceCode: referenceCode,
        };
    } catch (error) {
        const context = {
            step: "generateQRCode",
            referenceCode,
            amount,
            courseId,
        };
        errorLogger.log(error, context);
        throw error;
    }
};

/**
 * Generate QR code for payment
 * @param {number} amount - Amount in VND
 * @param {string} description - Payment description
 * @param {string} referenceCode - Order/transaction reference
 * @returns {Promise<{qrCode, qrDataURL, referenceCode}>}
 */
const createTransaction = async (currentUser, courseId) => {
    try {
        // Verify user exists
        if (!currentUser || !currentUser.id) {
            const error = new Error("User not found");
            error.code = "USER_NOT_FOUND";
            throw error;
        }

        // Verify course exists
        const course = await Course.findByPk(courseId);
        if (!course) {
            const error = new Error("Course not found");
            error.code = "COURSE_NOT_FOUND";
            throw error;
        }

        // Check if user already has access
        const existingAccess = await UserCourse.findOne({
            where: {
                user_id: currentUser.id,
                course_id: courseId,
            },
        });

        if (existingAccess) {
            const error = new Error("User already has access to this course");
            error.code = "ALREADY_ENROLLED";
            throw error;
        }

        // Check for duplicate pending payment - EDGE CASE 1
        const existingPayment = await validators.hasDuplicatePayment(
            Payment,
            currentUser.id,
            courseId
        );

        if (existingPayment) {
            errorLogger.logWarning("Duplicate payment attempt detected", {
                userId: currentUser.id,
                courseId,
                existingPaymentId: existingPayment.id,
                expiresAt: existingPayment.expires_at,
            });

            throw new DuplicatePaymentError(existingPayment.id);
        }

        // Generate unique reference code
        const randomSuffix = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();
        const referenceCode = `SEPAY_${Date.now()}_${
            currentUser.id
        }_${courseId}_${randomSuffix}`;

        // Generate QR code with retry logic
        const qrData = await retryManager.executeWithRetry(
            () =>
                generateQRCode(
                    course.price || 0,
                    `Course: ${course.title}`,
                    referenceCode,
                    courseId
                ),
            (attemptNumber, delay) => {
                errorLogger.logWarning(`Retrying QR generation`, {
                    attemptNumber,
                    delay,
                    referenceCode,
                });
            }
        );

        // Calculate expiry time (15 minutes from now)
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // Create payment record
        const payment = await Payment.create({
            user_id: currentUser.id,
            course_id: courseId,
            amount: course.price || 0,
            status: "pending",
            payment_method: "sepay",
            currency: "VND",
            sepay_transaction_id: null,
            qr_code: qrData.qrCode,
            reference_code: referenceCode,
            order_code: qrData.referenceCode,
            expires_at: expiresAt,
            payed_at: null,
        });

        errorLogger.logInfo("Transaction created successfully", {
            paymentId: payment.id,
            referenceCode,
            amount: course.price,
            expiresAt,
        });

        return payment;
    } catch (error) {
        const context = {
            step: "createTransaction",
            courseId,
            userId: currentUser?.id,
        };
        errorLogger.log(error, context);
        throw error;
    }
};

/**
 * Get transaction status from Sepay
 * @param {string} referenceCode - Reference code from payment
 * @returns {Promise<Object>}
 */
const getTransactionStatus = async (referenceCode) => {
    try {
        // Validate reference code
        if (!validators.isValidReferenceCode(referenceCode)) {
            const error = new Error("Invalid reference code format");
            error.code = "INVALID_REFERENCE_CODE";
            throw error;
        }

        const token = await getAccessToken();

        const response = await axios.get(
            `${SEPAY_API_URL}/v3/transfer-in/transactions?limit=100&offset=0`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                timeout: 10000,
            }
        );

        if (!response.data.success) {
            throw new Error(
                `Failed to fetch transactions: ${response.data.message}`
            );
        }

        // Find transaction by reference code
        const transactions = response.data.data || [];
        const transaction = transactions.find(
            (t) =>
                t.transferId === referenceCode ||
                t.description === referenceCode
        );

        if (!transaction) {
            return {
                found: false,
                status: "pending",
                message: "Transaction not found yet",
            };
        }

        // Handle failed transaction - EDGE CASE 2
        if (transaction.code !== "00" && transaction.status !== "completed") {
            return {
                found: true,
                id: transaction.id,
                status: "failed",
                code: transaction.code,
                message: "Payment failed at bank",
            };
        }

        return {
            found: true,
            id: transaction.id,
            status: transaction.status, // completed, pending, failed
            amount: transaction.amount,
            description: transaction.description,
            senderName: transaction.senderName,
            senderAccountNumber: transaction.senderAccountNumber,
            transactionDate: transaction.transactionDatetime,
            code: transaction.code, // 00 = success
        };
    } catch (error) {
        const context = { step: "getTransactionStatus", referenceCode };

        if (error.code === "ECONNABORTED") {
            const networkError = new NetworkError(error);
            errorLogger.log(networkError, context);
            throw networkError;
        }

        errorLogger.log(error, context);
        throw error;
    }
};

/**
 * Verify webhook signature
 * @param {Object} payload - Webhook payload
 * @param {string} signature - X-SEPAY-SIGNATURE header
 * @returns {boolean}
 */
const verifyWebhookSignature = (payload, signature) => {
    try {
        const secret = process.env.SEPAY_WEBHOOK_SECRET || "";
        const payloadString = JSON.stringify(payload);

        // Create HMAC SHA256 hash
        const hash = crypto
            .createHmac("sha256", secret)
            .update(payloadString)
            .digest("hex");

        const isValid = hash === signature;

        if (!isValid) {
            errorLogger.logWarning("Invalid webhook signature", {
                expected: hash,
                received: signature,
            });
        }

        return isValid;
    } catch (error) {
        errorLogger.log(error, { step: "verifyWebhookSignature" });
        return false;
    }
};

/**
 * Handle webhook callback from Sepay
 * Includes idempotency to prevent duplicate processing
 * @param {Object} webhookData - Webhook payload
 * @returns {Promise<Object>}
 */
const handleWebhookCallback = async (webhookData) => {
    try {
        const {
            referenceCode,
            amount,
            code,
            message,
            transferId,
            senderName,
            senderAccountNumber,
            transactionDate,
        } = webhookData;

        // EDGE CASE 3: Prevent duplicate webhook processing
        const webhookKey = webhookIdempotency.generateWebhookKey(
            transferId,
            transactionDate
        );

        if (webhookIdempotency.isWebhookProcessed(webhookKey)) {
            errorLogger.logInfo("Webhook already processed (duplicate)", {
                webhookKey,
                transferId,
            });
            return {
                success: true,
                message: "Payment already processed",
                isDuplicate: true,
            };
        }

        // code "00" = success
        if (code !== "00") {
            // EDGE CASE 2: Payment failed at bank
            errorLogger.logWarning(`Payment failed from bank`, {
                code,
                message,
                referenceCode,
            });

            // Find and mark payment as failed
            const failedPayment = await Payment.findOne({
                where: {
                    reference_code: referenceCode || transferId,
                },
            });

            if (failedPayment) {
                failedPayment.status = "failed";
                await failedPayment.save();
            }

            return {
                success: false,
                message: `Payment failed: ${message}`,
                code,
            };
        }

        // Find payment by reference code
        const payment = await Payment.findOne({
            where: {
                reference_code: referenceCode || transferId,
            },
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "email", "full_name"],
                },
                {
                    model: Course,
                    as: "course",
                    attributes: ["id", "title"],
                },
            ],
        });

        if (!payment) {
            errorLogger.logWarning(`Payment not found in webhook`, {
                referenceCode,
                transferId,
            });
            return {
                success: false,
                message: "Payment not found",
            };
        }

        // Check if payment already processed
        if (validators.isPaymentCompleted(payment.status)) {
            errorLogger.logWarning(`Payment already completed`, {
                paymentId: payment.id,
                status: payment.status,
            });

            webhookIdempotency.markWebhookProcessed(webhookKey);
            return {
                success: true,
                message: "Payment already processed",
                isDuplicate: true,
            };
        }

        // Verify amount matches
        if (Math.ceil(payment.amount) !== Math.ceil(amount)) {
            errorLogger.log(
                new Error(
                    `Amount mismatch. Expected: ${payment.amount}, Got: ${amount}`
                ),
                { paymentId: payment.id, referenceCode }
            );

            return {
                success: false,
                message: "Amount mismatch",
            };
        }

        // EDGE CASE 4: Check QR expiration
        if (payment.expires_at && validators.isQRExpired(payment.expires_at)) {
            errorLogger.logWarning(`Payment received after QR expiry`, {
                paymentId: payment.id,
                expiresAt: payment.expires_at,
            });
            // Still process it, but log the warning
        }

        // Update payment status
        payment.status = "completed";
        payment.sepay_transaction_id = transferId;
        payment.transaction_date = new Date(transactionDate);
        payment.payed_at = new Date();
        await payment.save();

        // Grant course access to user
        const [userCourse, created] = await UserCourse.findOrCreate({
            where: {
                user_id: payment.user_id,
                course_id: payment.course_id,
            },
            defaults: {
                progress: 0,
                completed: false,
            },
        });

        errorLogger.logInfo(`Course access granted`, {
            paymentId: payment.id,
            userId: payment.user_id,
            courseId: payment.course_id,
            userCourseCreated: created,
        });

        // Mark webhook as processed
        webhookIdempotency.markWebhookProcessed(webhookKey);

        return {
            success: true,
            message: "Payment processed successfully",
            payment,
            userCourse,
        };
    } catch (error) {
        errorLogger.log(error, { step: "handleWebhookCallback" });
        throw error;
    }
};

/**
 * Check and process pending payments
 * Useful for polling/manual status check
 * Includes timeout & expiry handling
 * @param {number} paymentId - Payment ID
 * @returns {Promise<Payment>}
 */
const checkAndUpdatePaymentStatus = async (paymentId) => {
    try {
        const payment = await Payment.findByPk(paymentId);

        if (!payment) {
            const error = new Error("Payment not found");
            error.code = "PAYMENT_NOT_FOUND";
            throw error;
        }

        if (payment.payment_method !== "sepay") {
            const error = new Error("Payment is not a Sepay payment");
            error.code = "INVALID_PAYMENT_METHOD";
            throw error;
        }

        // Skip if already completed
        if (validators.isPaymentCompleted(payment.status)) {
            return payment;
        }

        // EDGE CASE 5: Check QR expiration
        if (payment.expires_at && validators.isQRExpired(payment.expires_at)) {
            payment.status = "expired";
            await payment.save();

            errorLogger.logWarning(`QR code expired`, {
                paymentId,
                expiresAt: payment.expires_at,
            });

            throw new QRExpiredError(payment.expires_at);
        }

        // EDGE CASE 6: Check payment timeout (15+ minutes without update)
        if (validators.isPaymentTimedOut(payment.created_at, 15)) {
            errorLogger.logWarning(`Payment timeout`, {
                paymentId,
                createdAt: payment.created_at,
                minutesPassed: Math.floor(
                    (new Date() - new Date(payment.created_at)) / 60000
                ),
            });

            throw new PaymentTimeoutError(15);
        }

        // Get latest status from Sepay with retry logic
        const transactionStatus = await retryManager.executeWithRetry(
            () => getTransactionStatus(payment.reference_code),
            (attempt, delay) => {
                errorLogger.logWarning(`Retrying status check`, {
                    attempt,
                    delay,
                    paymentId,
                });
            }
        );

        if (!transactionStatus.found) {
            // Still pending, no update needed
            return payment;
        }

        // Handle failed transaction
        if (transactionStatus.status === "failed") {
            payment.status = "failed";
            await payment.save();

            errorLogger.logWarning(`Payment failed at bank`, {
                paymentId,
                code: transactionStatus.code,
                message: transactionStatus.message,
            });

            throw new PaymentFailedError(
                transactionStatus.message,
                transactionStatus.code
            );
        }

        // If Sepay says it's completed, process it
        if (transactionStatus.code === "00") {
            // Simulate webhook processing
            await handleWebhookCallback({
                referenceCode: payment.reference_code,
                amount: transactionStatus.amount,
                code: "00",
                message: "Success",
                transferId: transactionStatus.id,
                senderName: transactionStatus.senderName,
                senderAccountNumber: transactionStatus.senderAccountNumber,
                transactionDate: transactionStatus.transactionDate,
            });

            // Reload to get updated data
            await payment.reload();

            errorLogger.logInfo(`Payment status updated to completed`, {
                paymentId,
                reference_code: payment.reference_code,
            });
        }

        return payment;
    } catch (error) {
        const context = { step: "checkAndUpdatePaymentStatus", paymentId };
        errorLogger.log(error, context);
        throw error;
    }
};

/**
 * Validate if payment can be created
 * Checks for existing pending payments, user authentication, etc
 * @param {Object} user - Current user
 * @param {number} courseId - Course ID
 * @returns {Promise<{valid: boolean, error?: Object}>}
 */
const validatePaymentCreation = async (user, courseId) => {
    try {
        if (!user || !user.id) {
            return {
                valid: false,
                error: {
                    code: "USER_NOT_FOUND",
                    message: "User not authenticated",
                    ...errorResponses.USER_NOT_FOUND,
                },
            };
        }

        const course = await Course.findByPk(courseId);
        if (!course) {
            return {
                valid: false,
                error: {
                    code: "COURSE_NOT_FOUND",
                    message: "Course not found",
                    ...errorResponses.COURSE_NOT_FOUND,
                },
            };
        }

        // Check for existing access
        const existingAccess = await UserCourse.findOne({
            where: {
                user_id: user.id,
                course_id: courseId,
            },
        });

        if (existingAccess) {
            return {
                valid: false,
                error: {
                    code: "ALREADY_ENROLLED",
                    message: "User already has access to this course",
                },
            };
        }

        // Check for duplicate pending payment
        const duplicatePayment = await validators.hasDuplicatePayment(
            Payment,
            user.id,
            courseId
        );

        if (duplicatePayment) {
            return {
                valid: false,
                error: {
                    code: "DUPLICATE_PAYMENT",
                    message: "A payment for this course is already pending",
                    existingPaymentId: duplicatePayment.id,
                    ...errorResponses.DUPLICATE_PAYMENT,
                },
            };
        }

        return { valid: true };
    } catch (error) {
        errorLogger.log(error, { step: "validatePaymentCreation" });
        return {
            valid: false,
            error: {
                code: "VALIDATION_ERROR",
                message: error.message,
            },
        };
    }
};

/**
 * Cancel pending payment
 * @param {number} paymentId - Payment ID to cancel
 * @param {Object} currentUser - Current user object
 * @returns {Promise<{success: boolean, message: string}>}
 */
const cancelPayment = async (paymentId, currentUser) => {
    try {
        if (!paymentId || !currentUser || !currentUser.id) {
            const error = new Error("Invalid payment ID or user");
            error.code = "INVALID_REQUEST";
            throw error;
        }

        // Find payment
        const payment = await Payment.findByPk(paymentId);

        if (!payment) {
            const error = new Error("Payment not found");
            error.code = "PAYMENT_NOT_FOUND";
            throw error;
        }

        // Verify ownership
        if (payment.user_id !== currentUser.id) {
            const error = new Error("Unauthorized - Payment not owned by user");
            error.code = "UNAUTHORIZED";
            throw error;
        }

        // Only cancel if payment is pending
        if (payment.status !== "pending") {
            const error = new Error(
                `Cannot cancel payment with status: ${payment.status}`
            );
            error.code = "INVALID_PAYMENT_STATUS";
            throw error;
        }

        // Update payment status to cancelled
        canceled;
        await payment.update({ status: "cancelled" });

        errorLogger.logInfo("Payment cancelled successfully", {
            paymentId,
            userId: currentUser.id,
        });

        return {
            success: true,
            message: "Payment cancelled successfully",
        };
    } catch (error) {
        errorLogger.log(error, { step: "cancelPayment", paymentId });
        throw error;
    }
};

module.exports = {
    generateQRCode,
    createTransaction,
    getTransactionStatus,
    verifyWebhookSignature,
    handleWebhookCallback,
    checkAndUpdatePaymentStatus,
    validatePaymentCreation,
    cancelPayment,
    getAccessToken,
    RetryManager,
    errorLogger,
    errorResponses,
    validators,
};
