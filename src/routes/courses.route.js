const express = require("express");
const router = express.Router();

// Controller
const coursesController = require("../controller/courses.controller");

// Middleware
const checkAuth = require("@/middlewares/checkAuth");

//validator

// Routes
router.get("/", coursesController.getAll);
router.get("/:slug", checkAuth, coursesController.getBySlug);
router.get("/videos", coursesController.getAllVideos);
router.post("/register", checkAuth, coursesController.registerCourse);

module.exports = router;
