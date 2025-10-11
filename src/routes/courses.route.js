const express = require("express");
const router = express.Router();

// Controller
const coursesController = require("../controller/courses.controller");

// Middleware

//validator

// Routes
router.get("/", coursesController.getAll);
router.get("/:slug", coursesController.getBySlug);
router.get("/videos", coursesController.getAllVideos);

module.exports = router;
