const { Settings } = require("../../db/models");
const faviconService = require("./favicon.service");
const path = require("path");
const fs = require("fs").promises;
const sharp = require("sharp");

class SettingsService {
    async getSettings() {
        const settings = await Settings.findOne();
        return settings;
    }

    async updateSettings(data, logo) {
        try {
            const settings = await Settings.findOne();

            let logoPath = settings?.logo;
            let faviconPath = settings?.favicon;

            // Nếu có upload logo mới
            if (logo) {
                // Xóa logo cũ nếu có
                if (settings?.logo) {
                    try {
                        await fs.unlink(
                            path.join(__dirname, "../../", settings?.logo)
                        );
                    } catch (error) {
                        console.error("Error deleting old logo:", error);
                    }
                }

                // Lưu logo mới
                const ext = path.extname(logo?.originalname);
                const filename = `logo`;
                const uploadDir = path.join(__dirname, "../../uploads/imgs");
                await fs.mkdir(uploadDir, { recursive: true });

                // Read the uploaded file into a buffer
                const imageBuffer = await fs.readFile(logo?.path);

                // Process the image directly from buffer
                const finalPath = path.join(uploadDir, filename);
                logoPath = `uploads/imgs/${filename}`.replace(/\\/g, "/");

                try {
                    // Optimize and save the image directly from buffer
                    await sharp(imageBuffer)
                        .resize(800, 800, {
                            fit: "inside",
                            withoutEnlargement: true,
                        })
                        .toFile(finalPath);
                } catch (error) {
                    console.error("Image processing error:", error);
                    throw error;
                }

                // Generate new favicons from the optimized image
                try {
                    await faviconService.cleanupOldFavicons();
                    const favicons = await faviconService.generateFavicons(
                        finalPath
                    );

                    faviconPath = favicons.defaultFavicon; // Store the path of the default favicon
                } catch (faviconError) {
                    console.error("Favicon generation error:", faviconError);
                    // Continue with settings update even if favicon generation fails
                }
            }

            // Update settings
            if (!settings) {
                // Create new settings if none exist
                return await Settings.create({
                    name: data.name,
                    description: data.description,
                    logo: logoPath,
                    favicon: faviconPath,
                    ...data,
                });
            }

            // Update existing settings
            await settings.update({
                name: data.name,
                description: data.description,
                logo: logoPath,
                favicon: faviconPath,
                ...data,
            });

            return await this.getSettings();
        } catch (error) {
            console.error("Settings update error:", error);
            throw new Error("Failed to update settings: " + error.message);
        }
    }
}

module.exports = new SettingsService();
