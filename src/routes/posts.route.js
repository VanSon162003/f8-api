const express = require("express");
const router = express.Router();

const postsController = require("../controller/posts.controller");
const checkAuth = require("@/middlewares/checkAuth");
const {
    validateCreatePost,
    validateUpdatePost,
    validateGetPosts,
    validateId,
    validateSlug,
    validateTagSlug
} = require("../validators/post.validator");

// Public routes
router.get("/", validateGetPosts, postsController.getAllPosts);
router.get("/slug/:slug", validateSlug, postsController.getPostBySlug);
router.get("/tag/:tagName", validateGetPosts, postsController.getPostsByTag);

// Protected routes (require authentication)
router.get("/:id", validateId, postsController.getPostById);
router.post("/", checkAuth, validateCreatePost, postsController.createPost);
router.put("/:id", checkAuth, validateId, validateUpdatePost, postsController.updatePost);
router.delete("/:id", checkAuth, validateId, postsController.deletePost);

module.exports = router;
