/**
 * SEPAY ADMIN ROUTES
 * Admin endpoints for transaction management
 */

const express = require("express");
const router = express.Router();
const sepayAdminController = require("../../controller/api/sepayAdmin.controller");

/**
 * Middleware: Check admin access
 * All routes require admin role
 */
const requireAdmin = sepayAdminController.requireAdmin;

/**
 * GET /admin/sepay/transactions
 * Get all transactions with filters and pagination
 * Query params:
 *   - status: pending|completed|failed|all
 *   - page: 1
 *   - limit: 20
 *   - searchUser: user email or name
 *   - searchCourse: course title
 *   - dateFrom: ISO date
 *   - dateTo: ISO date
 *   - referenceCode: search reference code
 */
router.get("/transactions", requireAdmin, sepayAdminController.getTransactions);

/**
 * GET /admin/sepay/transactions/:paymentId
 * Get transaction detail
 */
router.get(
    "/transactions/:paymentId",
    requireAdmin,
    sepayAdminController.getTransactionDetail
);

/**
 * GET /admin/sepay/stats
 * Get transaction statistics
 * Query params:
 *   - dateFrom: ISO date
 *   - dateTo: ISO date
 * Returns:
 *   - summary: total, completed, pending, failed, completionRate
 *   - revenue: total, average
 *   - byStatus: count by status
 *   - byCourse: top 10 courses by revenue
 *   - dailyTransactions: last 30 days
 */
router.get("/stats", requireAdmin, sepayAdminController.getStats);

/**
 * GET /admin/sepay/export
 * Export transactions to CSV
 * Returns: CSV file
 */
router.get("/export", requireAdmin, sepayAdminController.exportTransactions);

/**
 * PUT /admin/sepay/transactions/:paymentId/status
 * Update transaction status
 * Body: { status: pending|completed|failed|expired, reason: string }
 */
router.put(
    "/transactions/:paymentId/status",
    requireAdmin,
    sepayAdminController.updateTransactionStatus
);

/**
 * POST /admin/sepay/transactions/:paymentId/refund
 * Refund a completed transaction
 * Body: { reason: string }
 */
router.post(
    "/transactions/:paymentId/refund",
    requireAdmin,
    sepayAdminController.refundTransaction
);

/**
 * GET /admin/sepay/user/:userId/transactions
 * Get transactions for specific user
 * Query params:
 *   - page: 1
 *   - limit: 10
 *   - status: pending|completed|failed|all
 */
router.get(
    "/user/:userId/transactions",
    requireAdmin,
    sepayAdminController.getUserTransactions
);

module.exports = router;
