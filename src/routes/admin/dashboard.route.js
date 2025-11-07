const express = require("express");
const router = express.Router();
const dashboardController = require("@/controller/admin/dashboard.controller");

// GET /api/admin/dashboard
router.get("/", dashboardController.getDashboardStats);

module.exports = router;
