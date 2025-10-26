const express = require("express");
const router = express.Router();

const usersRoute = require("./users.route");
const adminAuthRoute = require("./auth.route");
const courseRoute = require("./course.route");

router.use("/users", usersRoute);
router.use("/auth", adminAuthRoute);
router.use("/courses", courseRoute);

module.exports = router;
