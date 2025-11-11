const express = require("express");
const router = express.Router();

// Controller
const notesController = require("../../controller/api/notes.controller");

// Middleware
const checkAuth = require("@/middlewares/checkAuth");

// Routes
router.get("/", checkAuth, notesController.getAll);
router.post("/", checkAuth, notesController.create);
router.put("/:id", checkAuth, notesController.update);
router.delete("/:id", checkAuth, notesController.remove);

module.exports = router;
