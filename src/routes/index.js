const express = require("express");
const router = express.Router();

const authRoute = require("./auth.route");
const coursesRoute = require("./courses.route");
const postsRoute = require("./posts.route");
const commentsRoute = require("./comments.route");

router.use("/comments", commentsRoute);
router.use("/posts", postsRoute);
router.use("/courses", coursesRoute);
router.use("/auth", authRoute);

module.exports = router;
