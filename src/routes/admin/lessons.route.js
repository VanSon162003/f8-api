const express = require("express");
const router = express.Router();
const LessonsController = require("@/controller/admin/lessons.controller");
const checkAuth = require("@/middlewares/admin/checkAuthAdmin");
const upload = require("@/middlewares/upload");
const uploadVideo = require("@/middlewares/uploadVideo");

// Get all lessons with pagination
router.get("/", checkAuth, LessonsController.getAllLessons);

// Upload video (no need for transaction as it's just a file upload)
router.post(
    "/upload-video",
    checkAuth,
    uploadVideo.single("video"),
    LessonsController.uploadVideo
);

// Update lesson position
router.patch("/:id/position", checkAuth, LessonsController.updatePosition);

// Create new lesson with thumbnail and video upload
router.post(
    "/",
    checkAuth,
    upload.single("thumbnail"),
    LessonsController.createLesson
);

// Update lesson
router.patch(
    "/:id",
    checkAuth,
    upload.single("thumbnail"),
    LessonsController.updateLesson
);

// Delete lesson
router.delete("/:id", checkAuth, LessonsController.deleteLesson);

module.exports = router;
