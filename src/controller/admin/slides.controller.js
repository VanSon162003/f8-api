const response = require("@/utils/response");
const slidesService = require("@/service/slides.service");

class SlidesController {
    async getSlides(req, res) {
        try {
            const slides = await slidesService.getAllSlides();
            response.success(res, 200, slides);
        } catch (error) {
            response.error(res, 500, error.message);
        }
    }

    async createSlide(req, res) {
        try {
            const slide = await slidesService.createSlide(req.body, req.file);
            response.success(res, 201, slide);
        } catch (error) {
            response.error(res, 400, error.message);
        }
    }

    async updateSlide(req, res) {
        try {
            const { id } = req.params;
            const slide = await slidesService.updateSlide(
                id,
                req.body,
                req.file
            );
            response.success(res, 200, slide);
        } catch (error) {
            if (error.message === "Slide not found") {
                response.error(res, 404, error.message);
            } else {
                response.error(res, 400, error.message);
            }
        }
    }

    async deleteSlide(req, res) {
        try {
            const { id } = req.params;
            await slidesService.deleteSlide(id);
            response.success(res, 200, {
                message: "Slide deleted successfully",
            });
        } catch (error) {
            if (error.message === "Slide not found") {
                response.error(res, 404, error.message);
            } else {
                response.error(res, 400, error.message);
            }
        }
    }

    async updateOrder(req, res) {
        try {
            const { slides } = req.body;
            await slidesService.updateOrder(slides);
            response.success(res, 200, {
                message: "Slide order updated successfully",
            });
        } catch (error) {
            response.error(res, 400, error.message);
        }
    }
}

module.exports = new SlidesController();
