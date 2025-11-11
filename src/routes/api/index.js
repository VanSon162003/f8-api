const express = require("express");
const router = express.Router();

const authRoute = require("./auth.route");
const coursesRoute = require("./courses.route");
const postsRoute = require("./posts.route");
const uploadsRoute = require("./uploads.route");
const commentsRoute = require("./comments.route");
const likesRoute = require("./likes.route");
const bookmarksRoute = require("./bookmarks.route");
const videosRoute = require("./videos.route");
const learningPathsRoute = require("./learningPaths.route");
const paymentsRoute = require("./payments.route");
const pusherRoute = require("./pusher.route");
const notificationsRoute = require("./notifications.route");
const searchRoute = require("./search.route");
const slidesRoute = require("./slides.route");
const notesRoute = require("./notes.route");

router.use("/notifications", notificationsRoute);
router.use("/search", searchRoute);
router.use("/pusher", pusherRoute);
router.use("/payments", paymentsRoute);
router.use("/videos", videosRoute);
router.use("/comments", commentsRoute);
router.use("/notes", notesRoute);
router.use("/likes", likesRoute);
router.use("/bookmarks", bookmarksRoute);
router.use("/posts", postsRoute);
router.use("/uploads", uploadsRoute);
router.use("/courses", coursesRoute);
router.use("/auth", authRoute);
router.use("/learning-paths", learningPathsRoute);
router.use("/slides", slidesRoute);

module.exports = router;
