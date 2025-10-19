const express = require("express");
const router = express.Router();
const pusherController = require("@/controller/pusher.controller");
const checkAuth = require("@/middlewares/checkAuth");

router.post("/send-message", checkAuth, pusherController.sendMessage);

module.exports = router;
