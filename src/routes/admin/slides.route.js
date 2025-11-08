const express = require("express");
const router = express.Router();
const slidesController = require("@/controller/admin/slides.controller");
const upload = require("@/middlewares/upload");
const checkAuth = require("@/middlewares/checkAuth");

router.get("/", slidesController.getSlides);
router.post(
    "/",
    upload.single("image"),
    checkAuth,
    slidesController.createSlide
);
router.patch(
    "/:id",
    upload.single("image"),
    checkAuth,
    slidesController.updateSlide
);
router.delete("/:id", checkAuth, slidesController.deleteSlide);
router.patch("/order", checkAuth, slidesController.updateOrder);

module.exports = router;
