const express = require("express");
const router = express.Router();

const controller = require("../../controller/api/learningPaths.controller");
const checkAuth = require("@/middlewares/checkAuth");

router.get("/", checkAuth, controller.list);
router.get("/:slug", checkAuth, controller.getBySlug);

module.exports = router;
