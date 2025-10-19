const express = require("express");
const router = express.Router();
const notificationsController = require("@/controller/notifications.controller");
const checkAuth = require("@/middlewares/checkAuth");

router.post("/read", checkAuth, notificationsController.read);

module.exports = router;
