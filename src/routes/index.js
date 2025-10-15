const express = require("express");
const router = express.Router();

const authRoute = require("./auth.route");
const coursesRoute = require("./courses.route");
const postsRoute = require("./posts.route");
const commentsRoute = require("./comments.route");
const likesRoute = require("./likes.route");
const bookmarksRoute = require("./bookmarks.route");
const videosRoute = require("./videos.route");
const learningPathsRoute = require("./learningPaths.route");

router.use("/videos", videosRoute);
router.use("/comments", commentsRoute);
router.use("/likes", likesRoute);
router.use("/bookmarks", bookmarksRoute);
router.use("/posts", postsRoute);
router.use("/courses", coursesRoute);
router.use("/auth", authRoute);
router.use("/learning-paths", learningPathsRoute);

module.exports = router;
