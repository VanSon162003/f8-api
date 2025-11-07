const express = require("express");
const router = express.Router();
const settingsController = require("@/controller/admin/settings.controller");
const upload = require("@/middlewares/upload");

// GET /api/admin/settings
router.get("/", settingsController.getSettings);

// PUT /api/admin/settings
router.put("/", upload.single("logo"), settingsController.updateSettings);

module.exports = router;
