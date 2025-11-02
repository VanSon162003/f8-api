const express = require("express");
const router = express.Router();
const learningPathController = require("@/controller/admin/learningPath.controller");
const upload = require("@/middlewares/upload");

// GET /api/admin/learning-paths
router.get("/", learningPathController.getAllLearningPaths);

// GET /api/admin/learning-paths/:id
router.get("/:id", learningPathController.getLearningPathById);

// POST /api/admin/learning-paths
router.post(
    "/",
    upload.single("image"),
    learningPathController.createLearningPath
);

// PUT /api/admin/learning-paths/:id
router.put(
    "/:id",
    upload.single("image"),
    learningPathController.updateLearningPath
);

// DELETE /api/admin/learning-paths/:id
router.delete("/:id", learningPathController.deleteLearningPath);

// POST /api/admin/learning-paths/:pathId/courses
router.post("/:pathId/courses", learningPathController.addCourseToPath);

// DELETE /api/admin/learning-paths/:pathId/courses/:courseId
router.delete(
    "/:pathId/courses/:courseId",
    learningPathController.removeCourseFromPath
);

// PATCH /api/admin/learning-paths/:pathId/courses/:courseId/position
router.patch(
    "/:pathId/courses/:courseId/position",
    learningPathController.updateCoursePosition
);

module.exports = router;
