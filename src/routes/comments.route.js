const express = require("express");
const router = express.Router();

// Controller
const commentsController = require("../controller/comments.controller");

// Middleware
const checkAuth = require("@/middlewares/checkAuth");
//validator

// Routes
router.get("/:type/:id", checkAuth, commentsController.getAllByType);
router.post("/", checkAuth, commentsController.create);
router.put("/:id", checkAuth, commentsController.edit);
router.delete("/:id", checkAuth, commentsController.remove);
router.post("/:id/reaction", checkAuth, commentsController.handleReaction);

module.exports = router;
