const fs = require("fs");
const path = require("path");

/**
 * Xử lý logic đọc thông tin video và header streaming
 */
const getOne = async (filename, range) => {
    const videoPath = path.resolve(`src/uploads/videos/${filename}`);

    // Kiểm tra file tồn tại
    if (!fs.existsSync(videoPath)) {
        throw new Error("File video không tồn tại");
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;

    // Nếu client không gửi range → backend sẽ xử lý ở controller
    if (!range) {
        return { videoPath, fileSize };
    }

    // Xử lý stream video theo từng phần
    const chunkSize = 1 * 10 ** 6; // 1MB 
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + chunkSize, fileSize - 1);

    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };

    return { headers, videoPath, start, end };
};

module.exports = { getOne };
