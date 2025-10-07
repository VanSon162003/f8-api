const multer = require("multer");
const path = require("path");

// Cấu hình nơi lưu trữ
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // thư mục lưu file
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext);
        cb(null, `${basename}-${Date.now()}${ext}`);
    },
});

const upload = multer({ storage });

module.exports = upload;
