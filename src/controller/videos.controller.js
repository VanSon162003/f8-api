const videosService = require("@/service/videos.service");
const fs = require("fs");

const getOne = async (req, res) => {
    try {
        const { filename } = req.params;
        const range = req.headers.range;

        const result = await videosService.getOne(filename, range);

        if (!range) {
            const { videoPath, fileSize } = result;

            const head = {
                "Accept-Ranges": "bytes",
                "Content-Length": fileSize,
                "Content-Type": "video/mp4",
            };

            res.writeHead(200, head);
            fs.createReadStream(videoPath).pipe(res);
            return;
        }

        const { headers, videoPath, start, end } = result;

        res.writeHead(206, headers);
        const stream = fs.createReadStream(videoPath, { start, end });
        stream.pipe(res);

        stream.on("error", (err) => {
            console.error("Lỗi stream video:", err);
            if (!res.headersSent) {
                res.status(500).json({ message: "Lỗi khi đọc video" });
            }
        });
    } catch (error) {
        console.error("Video stream error:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = {
    getOne,
};
