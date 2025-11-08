const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffprobePath = require("@ffprobe-installer/ffprobe").path;

// Set both ffmpeg and ffprobe paths
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const getVideoDuration = (videoPath) => {
    console.log(12222222, videoPath);

    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
            if (err) {
                console.error("Error in ffprobe:", err);
                reject(err);
                return;
            }

            try {
                // Duration is in seconds
                const duration = metadata.format.duration;
                resolve(Math.round(duration));
            } catch (error) {
                console.error("Error extracting duration:", error);
                reject(error);
            }
        });
    });
};

module.exports = getVideoDuration;
