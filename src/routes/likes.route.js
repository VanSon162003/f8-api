const express = require("express");
const router = express.Router();

const likesController = require("../controller/likes.controller");
const checkAuth = require("@/middlewares/checkAuth");

// Protected routes (require authentication)
router.post("/toggle", checkAuth, likesController.toggleLike);
router.get("/check", checkAuth, likesController.checkUserLike);
router.get("/count", likesController.getLikeCount);

module.exports = router;
