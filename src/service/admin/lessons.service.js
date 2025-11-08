const { Lesson, Track, Course } = require("../../db/models");
const { sequelize } = require("../../db/models");
const { Op } = require("sequelize");
const ApiError = require("@/utils/ApiError");
const path = require("path");
const fs = require("fs");

// Helper function to save file
const saveFile = (file, directory) => {
    if (!file) return null;

    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }

    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const filename = `${basename}-${Date.now()}${ext}`;
    const destPath = path.join(directory, filename);

    fs.copyFileSync(file.path, destPath);
    return filename;
};

// Helper function to delete file
const deleteFile = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

class LessonsService {
    // Get all lessons with pagination
    async getAllLessons(page, limit, currentUser, search = "") {
        if (
            !currentUser ||
            (currentUser?.role !== "admin" &&
                currentUser?.role !== "instructor")
        ) {
            throw new ApiError(403, "Unauthorized");
        }
        const offset = (page - 1) * limit;

        const whereCondition = {};
        if (search) {
            whereCondition[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { "$track.title$": { [Op.like]: `%${search}%` } },
                { "$track.course.title$": { [Op.like]: `%${search}%` } },
            ];
        }

        const { rows: lessons, count: totalLessons } =
            await Lesson.findAndCountAll({
                where: whereCondition,
                include: [
                    {
                        model: Track,
                        as: "track",
                        attributes: ["id", "title"],
                        include: [
                            {
                                model: Course,
                                as: "course",
                                attributes: ["id", "title"],
                            },
                        ],
                    },
                ],
                attributes: [
                    "id",
                    "title",
                    "position",
                    "video_type",
                    "video_url",
                    "thumbnail",
                    "content",
                    "created_at",
                    "updated_at",
                ],
                limit,
                offset,
                order: [["position", "ASC"]],
                distinct: true,
            });

        return {
            lessons,
            pagination: {
                total: totalLessons,
                page,
                totalPages: Math.ceil(totalLessons / limit),
            },
        };
    }

    // Update lesson position
    async updatePosition(lessonId, position, trackId, currentUser) {
        if (
            !currentUser ||
            (currentUser?.role !== "admin" &&
                currentUser?.role !== "instructor")
        ) {
            throw new ApiError(403, "Unauthorized");
        }

        const transaction = await sequelize.transaction();

        try {
            // Get the lesson to update
            const lesson = await Lesson.findByPk(lessonId, { transaction });
            if (!lesson) {
                throw new Error("Không tìm thấy bài học");
            }

            // If moving to a new track
            if (trackId !== lesson.track_id) {
                // Check if track exists
                const track = await Track.findByPk(trackId, { transaction });
                if (!track) {
                    throw new Error("Không tìm thấy chương học");
                }

                // Decrease count in old track
                await Track.decrement("total_lesson", {
                    where: { id: lesson.track_id },
                    transaction,
                });

                // Increase count in new track
                await Track.increment("total_lesson", {
                    where: { id: trackId },
                    transaction,
                });

                // Get all lessons in old track with position > lesson.position
                const oldTrackLessons = await Lesson.findAll({
                    where: {
                        track_id: lesson.track_id,
                        position: { [Op.gt]: lesson.position },
                    },
                    order: [["position", "ASC"]],
                    transaction,
                });

                // Shift positions in old track
                for (const oldLesson of oldTrackLessons) {
                    await oldLesson.update(
                        { position: oldLesson.position - 1 },
                        { transaction }
                    );
                }

                // Get all lessons in new track with position >= newPosition
                const newTrackLessons = await Lesson.findAll({
                    where: {
                        track_id: trackId,
                        position: { [Op.gte]: position },
                    },
                    order: [["position", "ASC"]],
                    transaction,
                });

                // Shift positions in new track
                for (const newLesson of newTrackLessons) {
                    await newLesson.update(
                        { position: newLesson.position + 1 },
                        { transaction }
                    );
                }
            } else {
                // Moving within the same track
                const otherLessons = await Lesson.findAll({
                    where: {
                        track_id: trackId,
                        id: { [Op.ne]: lessonId },
                    },
                    order: [["position", "ASC"]],
                    transaction,
                });

                let newPositions = otherLessons.map((l) => l.position);
                newPositions.splice(position, 0, position);

                // Update all lesson positions
                await Promise.all([
                    lesson.update(
                        {
                            position,
                            track_id: trackId,
                        },
                        { transaction }
                    ),
                    ...otherLessons.map((l, idx) =>
                        l.update(
                            { position: idx < position ? idx + 1 : idx + 2 },
                            { transaction }
                        )
                    ),
                ]);
            }

            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // Create new lesson
    async createLesson(data, currentUser) {
        if (
            !currentUser ||
            (currentUser?.role !== "admin" &&
                currentUser?.role !== "instructor")
        ) {
            throw new ApiError(403, "Unauthorized");
        }

        const transaction = await sequelize.transaction();

        try {
            const existingTrack = await Track.findByPk(data.track_id);
            if (!existingTrack) {
                throw new Error("Không tìm thấy chương học");
            }

            // Handle thumbnail upload
            let thumbnail = null;
            if (data.thumbnail) {
                const imgDir = path.join(__dirname, "../../uploads/img");
                const filename = saveFile(data.thumbnail, imgDir);
                if (filename) {
                    thumbnail = `uploads/img/${filename}`;
                }
            }

            // Get last position in the track
            const trackLessons = await Lesson.findAll({
                where: { track_id: data.track_id },
                order: [["position", "DESC"]],
                limit: 1,
                transaction,
            });

            const lastPosition =
                trackLessons.length > 0 ? trackLessons[0].position : 0;

            // Get video duration if video URL is provided
            let duration = null;
            if (data.video_url && data.video_type === "upload") {
                try {
                    // Đường dẫn tuyệt đối đến thư mục gốc của dự án
                    const rootDir = path.resolve(__dirname, "../../");
                    // Xây dựng đường dẫn đầy đủ đến file video
                    const videoPath = path.join(
                        rootDir,
                        "uploads",
                        data.video_url
                    );

                    console.log(rootDir, data.video_url, 11111111111111111);

                    // Kiểm tra file có tồn tại không
                    if (!fs.existsSync(videoPath)) {
                        console.error("Video file not found:", videoPath);
                        throw new Error("Video file not found");
                    }

                    duration = await require("@/utils/getVideoDuration")(
                        videoPath
                    );
                } catch (error) {
                    console.error("Error getting video duration:", error);
                }
            }

            // Create lesson with next position
            const lesson = await Lesson.create(
                {
                    title: data.title,
                    track_id: data.track_id,
                    content: data.content,
                    video_type: data.video_type,
                    video_url: data.video_url,
                    thumbnail,
                    duration,
                    position: lastPosition + 1,
                },
                { transaction }
            );

            // Update track's total_lesson count and duration
            await Track.increment("total_lesson", {
                where: { id: data.track_id },
                transaction,
            });

            // Cập nhật total_duration của track
            const trackLessonsDuration = await Lesson.sum("duration", {
                where: { track_id: data.track_id },
                transaction,
            });

            await Track.update(
                { total_duration: trackLessonsDuration || 0 },
                {
                    where: { id: data.track_id },
                    transaction,
                }
            );

            // Cập nhật total_duration của course
            const track = await Track.findByPk(data.track_id, {
                transaction,
                include: [
                    {
                        model: Course,
                        as: "course",
                    },
                ],
            });

            if (track && track.course) {
                const courseTracks = await Track.findAll({
                    where: { course_id: track.course.id },
                    transaction,
                });

                const courseDuration = courseTracks.reduce((total, track) => {
                    return total + (track.total_duration || 0);
                }, 0);

                await Course.update(
                    { total_duration: courseDuration },
                    {
                        where: { id: track.course.id },
                        transaction,
                    }
                );
            }

            await transaction.commit();
            return lesson;
        } catch (error) {
            await transaction.rollback();

            // Cleanup files if transaction failed
            if (data.video) {
                deleteFile(data.video.path);
            }
            if (data.thumbnail) {
                deleteFile(data.thumbnail.path);
            }

            throw error;
        }
    }

    // Update lesson
    async updateLesson(id, data, currentUser) {
        if (
            !currentUser ||
            (currentUser?.role !== "admin" &&
                currentUser?.role !== "instructor")
        ) {
            throw new ApiError(403, "Unauthorized");
        }

        const transaction = await sequelize.transaction();

        try {
            const lesson = await Lesson.findByPk(id);
            if (!lesson) {
                throw new Error("Không tìm thấy bài học");
            }

            // Handle thumbnail if new one is provided
            let thumbnail = lesson.thumbnail;
            if (data.thumbnail) {
                const imgDir = path.join(__dirname, "../../uploads/img");
                const filename = saveFile(data.thumbnail, imgDir);
                if (filename) {
                    // Delete old thumbnail if exists
                    if (lesson.thumbnail) {
                        const oldThumbnailPath = path.join(
                            __dirname,
                            "../../",
                            lesson.thumbnail
                        );
                        deleteFile(oldThumbnailPath);
                    }
                    thumbnail = `uploads/img/${filename}`;
                }
            }

            // If track_id is changing, update total_lesson counts
            if (data.track_id && data.track_id !== lesson.track_id) {
                await Track.decrement("total_lesson", {
                    where: { id: lesson.track_id },
                    transaction,
                });
                await Track.increment("total_lesson", {
                    where: { id: data.track_id },
                    transaction,
                });
            }

            // Get video duration if video URL is provided or changed
            let duration = lesson.duration;
            if (
                data.video_url &&
                data.video_type === "upload" &&
                data.video_url !== lesson.video_url
            ) {
                try {
                    // Đường dẫn tuyệt đối đến thư mục gốc của dự án
                    const rootDir = path.resolve(__dirname, "../../");
                    // Xây dựng đường dẫn đầy đủ đến file video
                    const videoPath = path.join(rootDir, data.video_url);

                    // Kiểm tra file có tồn tại không
                    if (!fs.existsSync(videoPath)) {
                        console.error("Video file not found:", videoPath);
                        throw new Error("Video file not found");
                    }

                    duration = await require("@/utils/getVideoDuration")(
                        videoPath
                    );
                } catch (error) {
                    console.error("Error getting video duration:", error);
                }
            }

            // Update lesson with new data
            const updatedLesson = await lesson.update(
                {
                    ...data,
                    thumbnail,
                    duration,
                },
                { transaction }
            );

            // Cập nhật total_duration của track cũ (nếu chuyển track)
            const updateTrackDuration = async (trackId) => {
                const trackLessonsDuration = await Lesson.sum("duration", {
                    where: { track_id: trackId },
                    transaction,
                });

                const trackToUpdate = await Track.findByPk(trackId, {
                    transaction,
                    include: [
                        {
                            model: Course,
                            as: "course",
                        },
                    ],
                });

                await Track.update(
                    { total_duration: trackLessonsDuration || 0 },
                    {
                        where: { id: trackId },
                        transaction,
                    }
                );

                // Cập nhật total_duration của course
                if (trackToUpdate && trackToUpdate.course) {
                    const courseTracks = await Track.findAll({
                        where: { course_id: trackToUpdate.course.id },
                        transaction,
                    });

                    const courseDuration = courseTracks.reduce((total, t) => {
                        return total + (t.total_duration || 0);
                    }, 0);

                    await Course.update(
                        { total_duration: courseDuration },
                        {
                            where: { id: trackToUpdate.course.id },
                            transaction,
                        }
                    );
                }
            };

            // Cập nhật duration cho track hiện tại
            await updateTrackDuration(data.track_id || lesson.track_id);

            // Nếu đã chuyển track, cập nhật cả track cũ
            if (data.track_id && data.track_id !== lesson.track_id) {
                await updateTrackDuration(lesson.track_id);
            }

            await transaction.commit();
            return updatedLesson;
        } catch (error) {
            await transaction.rollback();

            // Cleanup new files if transaction failed
            if (data.video) {
                deleteFile(data.video.path);
            }
            if (data.thumbnail) {
                deleteFile(data.thumbnail.path);
            }

            throw error;
        }
    }

    // Delete lesson
    async deleteLesson(id, currentUser) {
        if (
            !currentUser ||
            (currentUser?.role !== "admin" &&
                currentUser?.role !== "instructor")
        ) {
            throw new ApiError(403, "Unauthorized");
        }

        const transaction = await sequelize.transaction();

        try {
            const lesson = await Lesson.findByPk(id);
            if (!lesson) {
                return false;
            }

            // Xóa ảnh thumbnail nếu có
            if (lesson.thumbnail_url) {
                const imagePath = path.join(
                    __dirname,
                    "../../",
                    lesson.thumbnail_url
                );
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

            // Decrement track's total_lesson count
            await Track.decrement("total_lesson", {
                where: { id: lesson.track_id },
                transaction,
            });

            // Delete the lesson
            await lesson.destroy({ transaction });

            // Reorder remaining lessons in the track
            const remainingLessons = await Lesson.findAll({
                where: { track_id: lesson.track_id },
                order: [["position", "ASC"]],
                transaction,
            });

            // Update positions
            await Promise.all(
                remainingLessons.map((lesson, index) =>
                    lesson.update({ position: index + 1 }, { transaction })
                )
            );

            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

module.exports = new LessonsService();
