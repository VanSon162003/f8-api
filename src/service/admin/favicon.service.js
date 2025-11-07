const fs = require("fs").promises;
const path = require("path");
const sharp = require("sharp");

class FaviconService {
    async generateFavicons(logoPath) {
        try {
            // Create favicon directory
            const faviconDir = path.join(__dirname, "../../uploads/favicons");
            await fs.mkdir(faviconDir, { recursive: true });

            // Generate different favicon sizes using sharp
            const sizes = [16, 32, 48, 64, 128, 256];

            // Generate PNG favicons
            for (const size of sizes) {
                const outputPath = path.join(
                    faviconDir,
                    `favicon-${size}x${size}.png`
                );

                await sharp(logoPath)
                    .resize(size, size, {
                        fit: "contain",
                        background: { r: 255, g: 255, b: 255, alpha: 0 },
                    })
                    .png()
                    .toFile(outputPath);
            }

            // Copy the 32x32 size as the default favicon.png
            await fs.copyFile(
                path.join(faviconDir, "favicon-32x32.png"),
                path.join(faviconDir, "favicon.png")
            );

            // Generate apple-touch-icon
            await sharp(logoPath)
                .resize(180, 180)
                .toFormat("png")
                .toFile(path.join(faviconDir, "apple-touch-icon.png"));

            // Create manifest.json
            const manifest = {
                name: "F8 Clone",
                short_name: "F8",
                icons: sizes.map((size) => ({
                    src: `/uploads/favicons/favicon-${size}x${size}.png`,
                    sizes: `${size}x${size}`,
                    type: "image/png",
                })),
                theme_color: "#ffffff",
                background_color: "#ffffff",
                display: "standalone",
            };

            await fs.writeFile(
                path.join(faviconDir, "manifest.json"),
                JSON.stringify(manifest, null, 2)
            );

            // Return paths for the generated favicons
            return {
                defaultFavicon: "uploads/favicons/favicon-32x32.png", // Most commonly used favicon size
                appleTouchIcon: "uploads/favicons/apple-touch-icon.png",
                manifest: "uploads/favicons/manifest.json",
                faviconDir: "uploads/favicons",
            };
        } catch (error) {
            console.error("Error generating favicons:", error);
            throw new Error("Failed to generate favicons: " + error.message);
        }
    }

    async cleanupOldFavicons() {
        try {
            const faviconDir = path.join(__dirname, "../../uploads/favicons");
            await fs.rm(faviconDir, { recursive: true, force: true });
        } catch (error) {
            console.error("Error cleaning up favicons:", error);
        }
    }
}

module.exports = new FaviconService();
