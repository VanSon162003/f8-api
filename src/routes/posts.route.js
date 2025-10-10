const express = require("express");
const router = express.Router();

// Controller
const postsController = require("../controller/posts.controller");

// Middleware

//validator

// Routes
router.get("/popular", postsController.getPopular);

module.exports = router;
