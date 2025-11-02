const express = require("express");
const router = express.Router();

const usersRoute = require("./users.route");
const adminAuthRoute = require("./auth.route");
const courseRoute = require("./course.route");
const tracksRoute = require("./tracks.route");
const lessonsRoute = require("./lessons.route");
const postsRoute = require("./posts.route");
const commentsRoute = require("./comments.route");
const learningPathRoute = require("./learningPath.route");

router.use("/users", usersRoute);
router.use("/auth", adminAuthRoute);
router.use("/courses", courseRoute);
router.use("/posts", postsRoute);
router.use("/comments", commentsRoute);
router.use("/lessons", lessonsRoute);
router.use("/tracks", tracksRoute);
router.use("/learning-paths", learningPathRoute);

module.exports = router;
