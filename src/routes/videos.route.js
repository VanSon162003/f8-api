const express = require("express");
const router = express.Router();

// Controller
const videosController = require("../controller/videos.controller");

// Middleware

//validator

// Routes
router.get("/:filename", videosController.getOne);

module.exports = router;
 