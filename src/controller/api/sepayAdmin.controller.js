/**
 * SEPAY ADMIN CONTROLLER
 * Handles admin endpoints for transaction management
 */

const sepayAdminService = require("@services/api/sepayAdmin.service");
const response = require("@/utils/response");
const { errorLogger } = require("@utils/sepayErrors");

/**
 * Middleware to check if user is admin
 */
const requireAdmin = (req, res, next) => {
    if (!req.user || !req.user.role || req.user.role !== "admin") {
        return response.error(res, 403, "Admin access required");
    }
    next();
};

/**
 * GET /admin/sepay/transactions
 * Get all transactions with filters and pagination
 * Query: ?status=completed&page=1&limit=20&searchUser=john&dateFrom=2025-11-01
 */
const getTransactions = async (req, res) => {
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
            page = 1,
            limit = 20,
        } = req.query;

        errorLogger.logInfo("Admin: Fetching transactions", {
            userId: req.user.id,
            filters: { status, searchUser, searchCourse },
        });

        const filters = {
            status,
            paymentMethod,
            dateFrom,
            dateTo,
            amount,
            searchUser,
            searchCourse,
            referenceCode,
        };

        const result = await sepayAdminService.getTransactions(
            filters,
            parseInt(page),
            parseInt(limit)
        );

        return response.success(res, 200, {
            success: true,
            data: result.data,
            pagination: {
                total: result.total,
                page: result.page,
                pages: result.pages,
                limit: result.limit,
            },
        });
    } catch (error) {
        errorLogger.log(error, { endpoint: "/admin/sepay/transactions" });
        return response.error(
            res,
            500,
            error.message || "Failed to fetch transactions"
        );
    }
};

/**
 * GET /admin/sepay/transactions/:paymentId
 * Get transaction detail
 */
const getTransactionDetail = async (req, res) => {
    try {
        const { paymentId } = req.params;

        if (!paymentId) {
            return response.error(res, 400, "Missing paymentId");
        }

        errorLogger.logInfo("Admin: Fetching transaction detail", {
            userId: req.user.id,
            paymentId,
        });

        const transaction = await sepayAdminService.getTransactionDetail(
            paymentId
        );

        return response.success(res, 200, {
            success: true,
            data: transaction,
        });
    } catch (error) {
        errorLogger.log(error, {
            endpoint: "/admin/sepay/transactions/:paymentId",
        });

        if (error.code === "PAYMENT_NOT_FOUND") {
            return response.error(res, 404, error.message);
        }

        return response.error(
            res,
            500,
            error.message || "Failed to fetch transaction"
        );
    }
};

/**
 * GET /admin/sepay/stats
 * Get transaction statistics
 * Query: ?dateFrom=2025-11-01&dateTo=2025-11-30
 */
const getStats = async (req, res) => {
    try {
        const { dateFrom, dateTo } = req.query;

        errorLogger.logInfo("Admin: Fetching transaction stats", {
            userId: req.user.id,
        });

        const stats = await sepayAdminService.getTransactionStats({
            dateFrom,
            dateTo,
        });

        return response.success(res, 200, {
            success: true,
            data: stats,
        });
    } catch (error) {
        errorLogger.log(error, { endpoint: "/admin/sepay/stats" });
        return response.error(
            res,
            500,
            error.message || "Failed to fetch statistics"
        );
    }
};

/**
 * GET /admin/sepay/export
 * Export transactions to CSV
 * Query: ?status=completed&dateFrom=2025-11-01
 */
const exportTransactions = async (req, res) => {
    try {
        const filters = req.query;

        errorLogger.logInfo("Admin: Exporting transactions", {
            userId: req.user.id,
        });

        const csv = await sepayAdminService.exportTransactionsCSV(filters);

        // Set CSV headers
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="sepay-transactions-${Date.now()}.csv"`
        );

        return res.send(csv);
    } catch (error) {
        errorLogger.log(error, { endpoint: "/admin/sepay/export" });
        return response.error(
            res,
            500,
            error.message || "Failed to export transactions"
        );
    }
};

/**
 * PUT /admin/sepay/transactions/:paymentId/status
 * Update transaction status (admin only)
 * Body: { status, reason }
 */
const updateTransactionStatus = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { status, reason } = req.body;

        if (!paymentId) {
            return response.error(res, 400, "Missing paymentId");
        }

        if (!status) {
            return response.error(res, 400, "Missing status");
        }

        errorLogger.logInfo("Admin: Updating transaction status", {
            userId: req.user.id,
            paymentId,
            newStatus: status,
            reason,
        });

        const transaction = await sepayAdminService.updateTransactionStatus(
            paymentId,
            status
        );

        return response.success(res, 200, {
            success: true,
            message: "Transaction status updated",
            data: transaction,
        });
    } catch (error) {
        errorLogger.log(error, {
            endpoint: "/admin/sepay/transactions/:paymentId/status",
        });

        if (error.code === "PAYMENT_NOT_FOUND") {
            return response.error(res, 404, error.message);
        }

        if (error.code === "INVALID_STATUS") {
            return response.error(res, 400, error.message);
        }

        return response.error(
            res,
            500,
            error.message || "Failed to update transaction"
        );
    }
};

/**
 * POST /admin/sepay/transactions/:paymentId/refund
 * Refund a completed transaction
 * Body: { reason }
 */
const refundTransaction = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { reason } = req.body;

        if (!paymentId) {
            return response.error(res, 400, "Missing paymentId");
        }

        errorLogger.logInfo("Admin: Processing refund", {
            userId: req.user.id,
            paymentId,
            reason,
        });

        const result = await sepayAdminService.refundTransaction(
            paymentId,
            reason
        );

        return response.success(res, 200, {
            success: true,
            message: result.message,
            data: result.refund,
        });
    } catch (error) {
        errorLogger.log(error, {
            endpoint: "/admin/sepay/transactions/:paymentId/refund",
        });

        if (error.code === "PAYMENT_NOT_FOUND") {
            return response.error(res, 404, error.message);
        }

        if (error.code === "CANNOT_REFUND_UNCOMPLETED") {
            return response.error(res, 400, error.message);
        }

        return response.error(
            res,
            500,
            error.message || "Failed to process refund"
        );
    }
};

/**
 * GET /admin/sepay/user/:userId/transactions
 * Get transactions for specific user
 */
const getUserTransactions = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, status } = req.query;

        if (!userId) {
            return response.error(res, 400, "Missing userId");
        }

        errorLogger.logInfo("Admin: Fetching user transactions", {
            adminId: req.user.id,
            userId,
        });

        const result = await sepayAdminService.getUserTransactions(
            parseInt(userId),
            {
                page: parseInt(page),
                limit: parseInt(limit),
                status,
            }
        );

        return response.success(res, 200, {
            success: true,
            data: result.data,
            pagination: {
                total: result.total,
                page: result.page,
                pages: result.pages,
            },
        });
    } catch (error) {
        errorLogger.log(error, {
            endpoint: "/admin/sepay/user/:userId/transactions",
        });
        return response.error(
            res,
            500,
            error.message || "Failed to fetch user transactions"
        );
    }
};

module.exports = {
    requireAdmin,
    getTransactions,
    getTransactionDetail,
    getStats,
    exportTransactions,
    updateTransactionStatus,
    refundTransaction,
    getUserTransactions,
};
