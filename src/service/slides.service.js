const { Slide } = require("@/db/models");
const fs = require("fs").promises;
const path = require("path");

class SlidesService {
    constructor() {
        this.uploadDir = path.join(__dirname, "../../src/uploads/imgs");
        this.relativePath = "uploads/imgs";
    }

    async createUploadDir() {
        try {
            await fs.mkdir(this.uploadDir, { recursive: true });
        } catch (error) {
            throw error;
        }
    }

    async saveImage(file) {
        try {
            await this.createUploadDir();

            const ext = path.extname(file.originalname);
            const filename = `slide-${Date.now()}${ext}`;
            const filePath = path.join(this.uploadDir, filename);

            await fs.copyFile(file.path, filePath);

            // Remove the temporary file
            try {
                await fs.unlink(file.path);
            } catch (error) {}

            return `${this.relativePath}/${filename}`;
        } catch (error) {
            throw error;
        }
    }

    async deleteImage(imagePath) {
        try {
            if (imagePath) {
                const fullPath = path.join(__dirname, "../../", imagePath);
                await fs.unlink(fullPath);
            }
        } catch (error) {}
    }

    async getAllSlides() {
        return await Slide.findAll({
            where: { isActive: true },
            order: [["order", "ASC"]],
        });
    }

    async createSlide(slideData, file) {
        try {
            if (file) {
                slideData.image = await this.saveImage(file);
            }
            return await Slide.create(slideData);
        } catch (error) {
            if (slideData.image) {
                await this.deleteImage(slideData.image);
            }
            throw error;
        }
    }

    async updateSlide(id, slideData, file) {
        const slide = await Slide.findByPk(id);
        if (!slide) {
            throw new Error("Slide not found");
        }

        try {
            if (file) {
                const oldImage = slide.image;
                slideData.image = await this.saveImage(file);
                await this.deleteImage(oldImage);
            }

            await slide.update(slideData);
            return await Slide.findByPk(id);
        } catch (error) {
            if (file && slideData.image) {
                await this.deleteImage(slideData.image);
            }
            throw error;
        }
    }

    async deleteSlide(id) {
        const slide = await Slide.findByPk(id);
        if (!slide) {
            throw new Error("Slide not found");
        }

        await this.deleteImage(slide.image);
        await slide.destroy();
        return slide;
    }

    async updateOrder(slides) {
        for (const slide of slides) {
            await Slide.update(
                { order: slide.order },
                { where: { id: slide.id } }
            );
        }
    }
}

module.exports = new SlidesService();
