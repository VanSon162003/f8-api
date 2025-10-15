const express = require("express");
const router = express.Router();

const bookmarksController = require("../controller/bookmarks.controller");
const checkAuth = require("@/middlewares/checkAuth");

// Protected routes (require authentication)
router.post("/toggle", checkAuth, bookmarksController.toggleBookmark);
router.get("/check", checkAuth, bookmarksController.checkUserBookmark);
router.get("/user", checkAuth, bookmarksController.getUserBookmarks);

module.exports = router;
