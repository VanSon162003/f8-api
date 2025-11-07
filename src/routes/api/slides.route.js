const express = require("express");
const router = express.Router();
const { Slide } = require("@/db/models");
const response = require("@/utils/response");

router.get("/", async (req, res) => {
    try {
        const slides = await Slide.findAll({
            where: { isActive: true },
            order: [["order", "ASC"]]
        });
        response.success(res, 200, slides);
    } catch (error) {
        response.error(res, 500, error.message);
    }
});

module.exports = router;