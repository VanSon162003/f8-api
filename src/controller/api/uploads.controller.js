const fs = require("fs");
const path = require("path");

const uploadImage = async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res
                .status(400)
                .json({ success: false, message: "No file uploaded" });
        }

        // 🗂️ Đảm bảo thư mục uploads/imgs tồn tại
        const uploadDir = path.join(__dirname, "../uploads/imgs");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // 📦 Lấy thông tin file
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext);
        const filename = `${basename}-${Date.now()}${ext}`;
        const destPath = path.join(uploadDir, filename);

        // 🚚 Di chuyển file từ thư mục tạm (multer) sang thư mục uploads/imgs
        fs.renameSync(file.path, destPath);

        // 🌐 URL public cho client sử dụng
        const fileUrl = `${req.protocol}://${req.get(
            "host"
        )}/api/v1/uploads/imgs/${filename}`;

        return res.status(200).json({
            success: true,
            url: fileUrl,
            fileName: filename,
            message: "Upload successful",
        });
    } catch (error) {
        console.error("Upload error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Upload failed",
        });
    }
};

module.exports = {
    uploadImage,
};
