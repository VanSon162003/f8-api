const express = require("express");
const router = express.Router();
const slidesController = require("@/controller/admin/slides.controller");
const upload = require("@/middlewares/upload");
const checkAuth = require("@/middlewares/checkAuth");

router.use(checkAuth);

router.get("/", slidesController.getSlides);
router.post("/", upload.single("image"), slidesController.createSlide);
router.patch("/:id", upload.single("image"), slidesController.updateSlide);
router.delete("/:id", slidesController.deleteSlide);
router.patch("/order", slidesController.updateOrder);

module.exports = router;
