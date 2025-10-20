const express = require("express");
const router = express.Router();

// Controller
const coursesController = require("../controller/courses.controller");

// Middleware
const checkAuth = require("@/middlewares/checkAuth");

//validator

// Routes
router.get("/", coursesController.getAll);
router.get("/user", checkAuth, coursesController.getByUser);
router.get("/:slug", checkAuth, coursesController.getBySlug);
router.get("/videos", coursesController.getAllVideos);
router.post("/register", checkAuth, coursesController.registerCourse);
router.get("/:courseId/progress", checkAuth, coursesController.getProgress);
router.post("/:courseId/progress", checkAuth, coursesController.updateProgress);
router.get(
    "/:courseId/user-lessons",
    checkAuth,
    coursesController.getUserLessonProgress
);
router.post(
    "/user-course-progress",
    checkAuth,
    coursesController.updateUserLessonProgress
);

module.exports = router;
