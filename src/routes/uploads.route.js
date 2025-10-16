const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const uploadsController = require("../controller/uploads.controller");

// POST /api/v1/uploads/imgs
router.post("/imgs", upload.single("file"), uploadsController.uploadImage);

module.exports = router;
