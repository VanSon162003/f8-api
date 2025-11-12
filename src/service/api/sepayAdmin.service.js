/**
 * SEPAY ADMIN SERVICE
 * Handles transaction management for admin dashboard
 */

const { Payment, User, Course, UserCourse } = require("@models");
const { Op, Sequelize } = require("sequelize");
const { errorLogger } = require("@utils/sepayErrors");

/**
 * Get all transactions with filters
 * @param {Object} filters - Filter criteria
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Results per page (default: 20)
 * @returns {Promise<{data, total, page, pages}>}
 */
const getTransactions = async (filters = {}, page = 1, limit = 20) => {
    try {
        const {
            status,
            paymentMethod,
            dateFrom,
            dateTo,
            amount,
            searchUser,
            searchCourse,
            referenceCode,
        } = filters;

        const offset = (page - 1) * limit;
        const where = { payment_method: "sepay" };

        // Filter by status
        if (status && status !== "all") {
            where.status = status;
        }

        // Filter by payment method
        if (paymentMethod && paymentMethod !== "all") {
            where.payment_method = paymentMethod;
        }

        // Filter by date range
        if (dateFrom || dateTo) {
            where.created_at = {};
            if (dateFrom) {
                where.created_at[Op.gte] = new Date(dateFrom);
            }
            if (dateTo) {
                where.created_at[Op.lte] = new Date(dateTo);
            }
        }

        // Filter by amount
        if (amount) {
            where.amount = amount;
        }

        // Filter by reference code
        if (referenceCode) {
            where.reference_code = {
                [Op.like]: `%${referenceCode}%`,
            };
        }

        const options = {
            where,
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "email", "full_name"],
                    required: searchUser ? true : false,
                },
                {
                    model: Course,
                    as: "course",
                    attributes: ["id", "title", "price"],
                    required: searchCourse ? true : false,
                },
            ],
            order: [["created_at", "DESC"]],
            offset,
            limit,
            distinct: true,
        };

        // Search by user
        if (searchUser) {
            options.include[0].where = {
                [Op.or]: [
                    { email: { [Op.like]: `%${searchUser}%` } },
                    { full_name: { [Op.like]: `%${searchUser}%` } },
                ],
            };
        }

        // Search by course
        if (searchCourse) {
            options.include[1].where = {
                title: { [Op.like]: `%${searchCourse}%` },
            };
        }

        const { count, rows } = await Payment.findAndCountAll(options);

        errorLogger.logInfo("Transactions fetched", {
            total: count,
            page,
            limit,
            filterCount: Object.keys(filters).length,
        });

        return {
            data: rows,
            total: count,
            page,
            pages: Math.ceil(count / limit),
            limit,
        };
    } catch (error) {
        errorLogger.log(error, { step: "getTransactions" });
        throw error;
    }
};

/**
 * Get transaction detail
 * @param {number} paymentId - Payment ID
 * @returns {Promise<Object>}
 */
const getTransactionDetail = async (paymentId) => {
    try {
        const payment = await Payment.findByPk(paymentId, {
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "email", "full_name", "phone"],
                },
                {
                    model: Course,
                    as: "course",
                    attributes: ["id", "title", "price", "description"],
                },
            ],
        });

        if (!payment) {
            const error = new Error("Transaction not found");
            error.code = "PAYMENT_NOT_FOUND";
            throw error;
        }

        // Get user course record
        const userCourse = await UserCourse.findOne({
            where: {
                user_id: payment.user_id,
                course_id: payment.course_id,
            },
        });

        errorLogger.logInfo("Transaction detail fetched", { paymentId });

        return {
            ...payment.toJSON(),
            userCourse: userCourse ? userCourse.toJSON() : null,
        };
    } catch (error) {
        errorLogger.log(error, { step: "getTransactionDetail", paymentId });
        throw error;
    }
};

/**
 * Get transaction statistics
 * @param {Object} dateRange - {dateFrom, dateTo}
 * @returns {Promise<Object>}
 */
const getTransactionStats = async (dateRange = {}) => {
    try {
        const { dateFrom, dateTo } = dateRange;
        const where = { payment_method: "sepay" };

        if (dateFrom || dateTo) {
            where.created_at = {};
            if (dateFrom) {
                where.created_at[Op.gte] = new Date(dateFrom);
            }
            if (dateTo) {
                where.created_at[Op.lte] = new Date(dateTo);
            }
        }

        // Total transactions
        const total = await Payment.count({ where });

        // Completed transactions
        const completed = await Payment.count({
            where: { ...where, status: "completed" },
        });

        // Pending transactions
        const pending = await Payment.count({
            where: { ...where, status: "pending" },
        });

        // Failed transactions
        const failed = await Payment.count({
            where: { ...where, status: "failed" },
        });

        // Total revenue
        const revenue = await Payment.findOne({
            where: { ...where, status: "completed" },
            attributes: [
                [Sequelize.fn("SUM", Sequelize.col("amount")), "total"],
            ],
            raw: true,
        });

        // Average transaction value
        const avgValue = await Payment.findOne({
            where: { ...where, status: "completed" },
            attributes: [[Sequelize.fn("AVG", Sequelize.col("amount")), "avg"]],
            raw: true,
        });

        // Transactions by status
        const byStatus = await Payment.findAll({
            where,
            attributes: [
                "status",
                [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
            ],
            group: ["status"],
            raw: true,
        });

        // Transactions by course (top 10)
        const byCourse = await Payment.findAll({
            where: { ...where, status: "completed" },
            attributes: [
                [Sequelize.col("course.id"), "courseId"],
                [Sequelize.col("course.title"), "courseTitle"],
                [Sequelize.fn("COUNT", Sequelize.col("payment.id")), "count"],
                [Sequelize.fn("SUM", Sequelize.col("payment.amount")), "total"],
            ],
            include: [
                {
                    model: Course,
                    as: "course",
                    attributes: [],
                    required: true,
                },
            ],
            group: ["course.id", "course.title"],
            order: [
                [Sequelize.fn("SUM", Sequelize.col("payment.amount")), "DESC"],
            ],
            limit: 10,
            raw: true,
        });

        // Daily transactions (last 30 days)
        const dailyTransactions = await Payment.findAll({
            where: {
                ...where,
                status: "completed",
                created_at: {
                    [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
            },
            attributes: [
                [Sequelize.fn("DATE", Sequelize.col("created_at")), "date"],
                [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
                [Sequelize.fn("SUM", Sequelize.col("amount")), "total"],
            ],
            group: [Sequelize.fn("DATE", Sequelize.col("created_at"))],
            order: [
                [Sequelize.fn("DATE", Sequelize.col("created_at")), "DESC"],
            ],
            raw: true,
        });

        errorLogger.logInfo("Transaction stats calculated", {
            total,
            completed,
            pending,
            failed,
        });

        return {
            summary: {
                total,
                completed,
                pending,
                failed,
                completionRate:
                    total > 0 ? ((completed / total) * 100).toFixed(2) : 0,
            },
            revenue: {
                total: revenue.total || 0,
                average: avgValue.avg || 0,
            },
            byStatus,
            byCourse,
            dailyTransactions,
        };
    } catch (error) {
        errorLogger.log(error, { step: "getTransactionStats" });
        throw error;
    }
};

/**
 * Export transactions to CSV format
 * @param {Object} filters - Filter criteria
 * @returns {Promise<string>} CSV data
 */
const exportTransactionsCSV = async (filters = {}) => {
    try {
        // Get all transactions matching filters
        const allTransactions = await Payment.findAll({
            where: { payment_method: "sepay" },
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["email", "full_name"],
                },
                {
                    model: Course,
                    as: "course",
                    attributes: ["title", "price"],
                },
            ],
            order: [["created_at", "DESC"]],
            raw: true,
        });

        // Build CSV header
        const headers = [
            "ID",
            "Reference Code",
            "User Email",
            "User Name",
            "Course Title",
            "Amount",
            "Status",
            "Payment Method",
            "Transaction ID",
            "Created At",
            "Paid At",
        ];

        // Build CSV rows
        const rows = allTransactions.map((payment) => [
            payment.id,
            payment.reference_code || "",
            payment["user.email"] || "",
            payment["user.full_name"] || "",
            payment["course.title"] || "",
            payment.amount,
            payment.status,
            payment.payment_method,
            payment.sepay_transaction_id || "",
            payment.created_at,
            payment.payed_at || "",
        ]);

        // Combine headers and rows
        const csv = [
            headers.join(","),
            ...rows.map((row) =>
                row
                    .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
                    .join(",")
            ),
        ].join("\n");

        errorLogger.logInfo("Transactions exported to CSV", {
            count: allTransactions.length,
        });

        return csv;
    } catch (error) {
        errorLogger.log(error, { step: "exportTransactionsCSV" });
        throw error;
    }
};

/**
 * Update transaction status (admin only)
 * @param {number} paymentId - Payment ID
 * @param {string} newStatus - New status (pending, completed, failed, expired)
 * @returns {Promise<Payment>}
 */
const updateTransactionStatus = async (paymentId, newStatus) => {
    try {
        const validStatuses = ["pending", "completed", "failed", "expired"];

        if (!validStatuses.includes(newStatus)) {
            const error = new Error(`Invalid status: ${newStatus}`);
            error.code = "INVALID_STATUS";
            throw error;
        }

        const payment = await Payment.findByPk(paymentId);

        if (!payment) {
            const error = new Error("Transaction not found");
            error.code = "PAYMENT_NOT_FOUND";
            throw error;
        }

        const oldStatus = payment.status;

        // If changing to completed, create user course
        if (newStatus === "completed" && oldStatus !== "completed") {
            await UserCourse.findOrCreate({
                where: {
                    user_id: payment.user_id,
                    course_id: payment.course_id,
                },
                defaults: {
                    progress: 0,
                    completed: false,
                },
            });

            payment.payed_at = new Date();
        }

        payment.status = newStatus;
        await payment.save();

        errorLogger.logInfo("Transaction status updated", {
            paymentId,
            oldStatus,
            newStatus,
        });

        return payment;
    } catch (error) {
        errorLogger.log(error, { step: "updateTransactionStatus", paymentId });
        throw error;
    }
};

/**
 * Manually refund a transaction
 * @param {number} paymentId - Payment ID
 * @param {string} reason - Refund reason
 * @returns {Promise<{success, message, refund}>}
 */
const refundTransaction = async (paymentId, reason = "") => {
    try {
        const payment = await Payment.findByPk(paymentId, {
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
            const error = new Error("Transaction not found");
            error.code = "PAYMENT_NOT_FOUND";
            throw error;
        }

        if (payment.status !== "completed") {
            const error = new Error("Only completed payments can be refunded");
            error.code = "CANNOT_REFUND_UNCOMPLETED";
            throw error;
        }

        // Create refund record
        const refund = {
            payment_id: paymentId,
            amount: payment.amount,
            reason: reason || "Admin refund",
            status: "pending",
            created_at: new Date(),
            processed_at: null,
        };

        // Remove user course access
        await UserCourse.destroy({
            where: {
                user_id: payment.user_id,
                course_id: payment.course_id,
            },
        });

        // Mark payment as refunded
        payment.status = "refunded";
        await payment.save();

        errorLogger.logInfo("Transaction refunded", {
            paymentId,
            amount: payment.amount,
            userId: payment.user_id,
            reason,
        });

        return {
            success: true,
            message: "Transaction refunded successfully",
            refund,
            payment,
        };
    } catch (error) {
        errorLogger.log(error, { step: "refundTransaction", paymentId });
        throw error;
    }
};

/**
 * Get user transaction history
 * @param {number} userId - User ID
 * @param {Object} options - {page, limit, status}
 * @returns {Promise<{data, total, page, pages}>}
 */
const getUserTransactions = async (userId, options = {}) => {
    try {
        const { page = 1, limit = 10, status } = options;
        const offset = (page - 1) * limit;

        const where = {
            user_id: userId,
            payment_method: "sepay",
        };

        if (status) {
            where.status = status;
        }

        const { count, rows } = await Payment.findAndCountAll({
            where,
            include: [
                {
                    model: Course,
                    as: "course",
                    attributes: ["id", "title", "price"],
                },
            ],
            order: [["created_at", "DESC"]],
            offset,
            limit,
        });

        errorLogger.logInfo("User transactions fetched", {
            userId,
            count,
            status: status || "all",
        });

        return {
            data: rows,
            total: count,
            page,
            pages: Math.ceil(count / limit),
        };
    } catch (error) {
        errorLogger.log(error, { step: "getUserTransactions", userId });
        throw error;
    }
};

module.exports = {
    getTransactions,
    getTransactionDetail,
    getTransactionStats,
    exportTransactionsCSV,
    updateTransactionStatus,
    refundTransaction,
    getUserTransactions,
};
