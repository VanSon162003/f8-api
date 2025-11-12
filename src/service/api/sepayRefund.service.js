/**
 * SEPAY REFUND SERVICE
 * Handles refund & cancel logic for payments
 */

const { Payment, User, Course, UserCourse, Refund } = require("@models");
const { Op, Sequelize } = require("sequelize");
const { errorLogger } = require("@utils/sepayErrors");

/**
 * Create refund record
 * @param {number} paymentId - Payment ID
 * @param {string} reason - Refund reason
 * @param {string} requestedBy - User who requested refund (user_id or admin)
 * @returns {Promise<Object>}
 */
const createRefund = async (paymentId, reason = "", requestedBy = "admin") => {
    try {
        const payment = await Payment.findByPk(paymentId, {
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "email", "full_name"],
                },
                { model: Course, as: "course", attributes: ["id", "title"] },
            ],
        });

        if (!payment) {
            const error = new Error("Payment not found");
            error.code = "PAYMENT_NOT_FOUND";
            throw error;
        }

        // Check if payment can be refunded
        if (payment.status !== "completed") {
            const error = new Error(
                `Cannot refund payment with status: ${payment.status}`
            );
            error.code = "CANNOT_REFUND_STATUS";
            throw error;
        }

        // Check if refund already exists
        const existingRefund = await Refund.findOne({
            where: {
                payment_id: paymentId,
                status: { [Op.in]: ["pending", "processing", "completed"] },
            },
        });

        if (existingRefund) {
            const error = new Error("Refund already exists for this payment");
            error.code = "REFUND_ALREADY_EXISTS";
            throw error;
        }

        // Create refund record
        const refund = await Refund.create({
            payment_id: paymentId,
            amount: payment.amount,
            reason: reason || "User requested refund",
            status: "pending",
            requested_by: requestedBy,
            requested_at: new Date(),
            completed_at: null,
            notes: "",
        });

        errorLogger.logInfo("Refund created", {
            refundId: refund.id,
            paymentId,
            amount: payment.amount,
            reason,
        });

        return {
            success: true,
            message: "Refund initiated successfully",
            refund: refund.toJSON(),
            payment: {
                id: payment.id,
                amount: payment.amount,
                user: payment.user,
                course: payment.course,
            },
        };
    } catch (error) {
        errorLogger.log(error, { step: "createRefund", paymentId });
        throw error;
    }
};

/**
 * Process refund (approve and execute)
 * @param {number} refundId - Refund ID
 * @param {string} approvedBy - Admin who approved (user_id)
 * @returns {Promise<Object>}
 */
const processRefund = async (refundId, approvedBy = "admin") => {
    try {
        const refund = await Refund.findByPk(refundId, {
            include: [
                {
                    model: Payment,
                    as: "payment",
                    include: [
                        {
                            model: User,
                            as: "user",
                            attributes: ["id", "email"],
                        },
                        {
                            model: Course,
                            as: "course",
                            attributes: ["id", "title"],
                        },
                    ],
                },
            ],
        });

        if (!refund) {
            const error = new Error("Refund not found");
            error.code = "REFUND_NOT_FOUND";
            throw error;
        }

        if (refund.status !== "pending") {
            const error = new Error(
                `Cannot process refund with status: ${refund.status}`
            );
            error.code = "INVALID_REFUND_STATUS";
            throw error;
        }

        // Update refund status
        refund.status = "processing";
        await refund.save();

        // Update payment status
        const payment = refund.payment;
        payment.status = "refunded";
        await payment.save();

        // Remove user course access
        const userCourseDeleted = await UserCourse.destroy({
            where: {
                user_id: payment.user_id,
                course_id: payment.course_id,
            },
        });

        // Mark refund as completed
        refund.status = "completed";
        refund.approved_by = approvedBy;
        refund.completed_at = new Date();
        await refund.save();

        errorLogger.logInfo("Refund processed", {
            refundId,
            paymentId: payment.id,
            userId: payment.user_id,
            courseId: payment.course_id,
            amount: refund.amount,
            userCourseDeleted,
        });

        return {
            success: true,
            message: "Refund processed successfully",
            refund: refund.toJSON(),
            payment: payment.toJSON(),
            courseAccessRemoved: userCourseDeleted > 0,
        };
    } catch (error) {
        errorLogger.log(error, { step: "processRefund", refundId });
        throw error;
    }
};

/**
 * Reject refund
 * @param {number} refundId - Refund ID
 * @param {string} rejectionReason - Reason for rejection
 * @param {string} rejectedBy - Admin who rejected
 * @returns {Promise<Object>}
 */
const rejectRefund = async (
    refundId,
    rejectionReason = "",
    rejectedBy = "admin"
) => {
    try {
        const refund = await Refund.findByPk(refundId);

        if (!refund) {
            const error = new Error("Refund not found");
            error.code = "REFUND_NOT_FOUND";
            throw error;
        }

        if (refund.status !== "pending") {
            const error = new Error(
                `Cannot reject refund with status: ${refund.status}`
            );
            error.code = "INVALID_REFUND_STATUS";
            throw error;
        }

        // Update refund status
        refund.status = "rejected";
        refund.rejected_by = rejectedBy;
        refund.rejected_at = new Date();
        refund.notes = rejectionReason || "Refund rejected by admin";
        await refund.save();

        errorLogger.logInfo("Refund rejected", {
            refundId,
            reason: rejectionReason,
        });

        return {
            success: true,
            message: "Refund rejected",
            refund: refund.toJSON(),
        };
    } catch (error) {
        errorLogger.log(error, { step: "rejectRefund", refundId });
        throw error;
    }
};

/**
 * Cancel pending payment
 * @param {number} paymentId - Payment ID
 * @param {string} reason - Cancellation reason
 * @param {string} cancelledBy - User ID who cancelled
 * @returns {Promise<Object>}
 */
const cancelPayment = async (paymentId, reason = "", cancelledBy = "user") => {
    try {
        const payment = await Payment.findByPk(paymentId, {
            include: [
                { model: User, as: "user", attributes: ["id", "email"] },
                { model: Course, as: "course", attributes: ["id", "title"] },
            ],
        });

        if (!payment) {
            const error = new Error("Payment not found");
            error.code = "PAYMENT_NOT_FOUND";
            throw error;
        }

        // Can only cancel pending or processing payments
        if (!["pending", "processing"].includes(payment.status)) {
            const error = new Error(
                `Cannot cancel payment with status: ${payment.status}`
            );
            error.code = "CANNOT_CANCEL_STATUS";
            throw error;
        }

        // Update payment status
        payment.status = "cancelled";
        await payment.save();

        errorLogger.logInfo("Payment cancelled", {
            paymentId,
            reason,
            cancelledBy,
            amount: payment.amount,
        });

        return {
            success: true,
            message: "Payment cancelled successfully",
            payment: payment.toJSON(),
        };
    } catch (error) {
        errorLogger.log(error, { step: "cancelPayment", paymentId });
        throw error;
    }
};

/**
 * Get refund history for payment
 * @param {number} paymentId - Payment ID
 * @returns {Promise<Array>}
 */
const getRefundHistory = async (paymentId) => {
    try {
        const refunds = await Refund.findAll({
            where: { payment_id: paymentId },
            order: [["created_at", "DESC"]],
        });

        errorLogger.logInfo("Refund history fetched", {
            paymentId,
            count: refunds.length,
        });

        return refunds;
    } catch (error) {
        errorLogger.log(error, { step: "getRefundHistory", paymentId });
        throw error;
    }
};

/**
 * Get all pending refunds
 * @param {Object} options - {page, limit}
 * @returns {Promise<{data, total, page, pages}>}
 */
const getPendingRefunds = async (options = {}) => {
    try {
        const { page = 1, limit = 20 } = options;
        const offset = (page - 1) * limit;

        const { count, rows } = await Refund.findAndCountAll({
            where: { status: "pending" },
            include: [
                {
                    model: Payment,
                    as: "payment",
                    include: [
                        {
                            model: User,
                            as: "user",
                            attributes: ["email", "full_name"],
                        },
                        { model: Course, as: "course", attributes: ["title"] },
                    ],
                },
            ],
            order: [["created_at", "ASC"]],
            offset,
            limit,
        });

        errorLogger.logInfo("Pending refunds fetched", {
            count,
            page,
            limit,
        });

        return {
            data: rows,
            total: count,
            page,
            pages: Math.ceil(count / limit),
        };
    } catch (error) {
        errorLogger.log(error, { step: "getPendingRefunds" });
        throw error;
    }
};

/**
 * Get refund statistics
 * @param {Object} dateRange - {dateFrom, dateTo}
 * @returns {Promise<Object>}
 */
const getRefundStats = async (dateRange = {}) => {
    try {
        const { dateFrom, dateTo } = dateRange;
        const where = {};

        if (dateFrom || dateTo) {
            where.created_at = {};
            if (dateFrom) where.created_at[Op.gte] = new Date(dateFrom);
            if (dateTo) where.created_at[Op.lte] = new Date(dateTo);
        }

        // Total refunds
        const totalRefunds = await Refund.count({ where });

        // Completed refunds
        const completedRefunds = await Refund.count({
            where: { ...where, status: "completed" },
        });

        // Rejected refunds
        const rejectedRefunds = await Refund.count({
            where: { ...where, status: "rejected" },
        });

        // Pending refunds
        const pendingRefunds = await Refund.count({
            where: { ...where, status: "pending" },
        });

        // Total refund amount
        const totalAmount = await Refund.findOne({
            where: { ...where, status: "completed" },
            attributes: [
                [Sequelize.fn("SUM", Sequelize.col("amount")), "total"],
            ],
            raw: true,
        });

        // Average refund amount
        const avgAmount = await Refund.findOne({
            where: { ...where, status: "completed" },
            attributes: [[Sequelize.fn("AVG", Sequelize.col("amount")), "avg"]],
            raw: true,
        });

        // Refunds by reason
        const byReason = await Refund.findAll({
            where,
            attributes: [
                "reason",
                [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
                [Sequelize.fn("SUM", Sequelize.col("amount")), "total"],
            ],
            group: ["reason"],
            raw: true,
        });

        errorLogger.logInfo("Refund stats calculated", {
            totalRefunds,
            completedRefunds,
            rejectedRefunds,
        });

        return {
            summary: {
                total: totalRefunds,
                completed: completedRefunds,
                rejected: rejectedRefunds,
                pending: pendingRefunds,
                completionRate:
                    totalRefunds > 0
                        ? ((completedRefunds / totalRefunds) * 100).toFixed(2)
                        : 0,
            },
            amount: {
                total: totalAmount.total || 0,
                average: avgAmount.avg || 0,
            },
            byReason,
        };
    } catch (error) {
        errorLogger.log(error, { step: "getRefundStats" });
        throw error;
    }
};

module.exports = {
    createRefund,
    processRefund,
    rejectRefund,
    cancelPayment,
    getRefundHistory,
    getPendingRefunds,
    getRefundStats,
};
