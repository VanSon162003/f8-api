const express = require("express");
const router = express.Router();
const TracksController = require("@/controller/admin/tracks.controller");
const checkAuth = require("@/middlewares/admin/checkAuthAdmin");

// Get all tracks with pagination
router.get("/", checkAuth, TracksController.getAllTracks);

// Create new track
router.post("/", checkAuth, TracksController.createTrack);

// Update track
router.patch("/:id", checkAuth, TracksController.updateTrack);

// Delete track
router.delete("/:id", checkAuth, TracksController.deleteTrack);

// Update track positions
router.put("/positions", checkAuth, TracksController.updatePositions);

module.exports = router;
