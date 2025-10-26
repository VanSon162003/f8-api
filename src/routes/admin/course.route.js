const express = require("express");
const router = express.Router();
const courseController = require("@controllers/admin/course.controller");
const validate = require("@/middlewares/validate");
const courseValidator = require("@/validator/admin/course.validator");
const upload = require("@/middlewares/upload");

const checkAuthAdmin = require("@/middlewares/admin/checkAuthAdmin");

router.get("/", checkAuthAdmin, courseController.getAllCourses);

router.post(
    "/",
    upload.single("thumbnail"),
    validate(courseValidator.createCourse),
    checkAuthAdmin,
    courseController.createCourse
);

router.patch(
    "/:id",
    upload.single("thumbnail"),
    validate(courseValidator.updateCourse),
    checkAuthAdmin,
    courseController.editCourse
);

router.patch("/:id/status", courseController.updateCourseStatus);

router.delete("/:id", courseController.removeCourse);

module.exports = router;
