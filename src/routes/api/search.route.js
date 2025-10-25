const express = require("express");
const router = express.Router();
const searchController = require("../../controller/api/search.controller");

// Route cho search API
router.get("/", searchController.index);

module.exports = router;
