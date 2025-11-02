const express = require("express");
const router = express.Router();
const postsController = require("../../controller/admin/posts.controller");

router.get("/", postsController.getAllPosts);
router.patch("/:id/approve", postsController.updateApproveStatus);
router.delete("/:id", postsController.deletePost);
router.post("/approve-all", postsController.approveAllPosts);

module.exports = router;
