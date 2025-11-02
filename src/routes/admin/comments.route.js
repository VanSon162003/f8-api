const express = require("express");
const router = express.Router();
const commentsController = require("../../controller/admin/comments.controller");

router.get("/", commentsController.getAllComments);
router.patch("/:id/visibility", commentsController.updateVisibility);

module.exports = router;
