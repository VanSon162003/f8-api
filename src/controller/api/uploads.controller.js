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

        // 🗂️ Đảm bảo thư mục src/uploads/imgs tồn tại
        const uploadDir = path.join(__dirname, "../../uploads/imgs");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // 📦 Lấy thông tin file và tạo tên file mới
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext);
        const filename = `${basename}-${Date.now()}${ext}`;
        const destPath = path.join(uploadDir, filename);

        // 🚚 Di chuyển file từ thư mục tạm sang thư mục đích
        fs.copyFileSync(file.path, destPath);
        fs.unlinkSync(file.path); // Xóa file tạm sau khi đã copy

        // 🌐 URL public cho client sử dụng
        const fileUrl = `${req.protocol}://${req.get(
            "host"
        )}/api/v1/uploads/imgs/${filename}`;

        // 📁 Đường dẫn tương đối để lưu vào database
        const relativePath = `uploads/imgs/${filename}`;

        return res.status(200).json({
            success: true,
            url: fileUrl, // URL đầy đủ cho client
            path: relativePath, // Đường dẫn tương đối để lưu DB
            fileName: filename, // Tên file
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
