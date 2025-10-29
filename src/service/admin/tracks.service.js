const { Track, Course, sequelize } = require("@/db/models");
const { Op } = require("sequelize");

class TracksService {
    // Get all tracks with pagination
    async getAllTracks(page, limit, currentUser, search = "") {
        if (!currentUser || currentUser.role !== "admin") {
            throw new ApiError(403, "Unauthorized");
        }
        const offset = (page - 1) * limit;

        const whereCondition = {};
        if (search) {
            whereCondition[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { "$course.title$": { [Op.like]: `%${search}%` } },
            ];
        }

        const { rows: tracks, count: totalTracks } =
            await Track.findAndCountAll({
                where: whereCondition,
                include: [
                    {
                        model: Course,
                        as: "course",
                        attributes: ["id", "title"],
                    },
                ],
                attributes: [
                    "id",
                    "title",
                    "course_id",
                    "position",
                    [
                        sequelize.literal(
                            "(SELECT COUNT(*) FROM lessons WHERE track_id = Track.id)"
                        ),
                        "total_lessons",
                    ],
                ],
                limit,
                offset,
                order: [["position", "ASC"]],
                distinct: true,
            });

        return {
            tracks,
            pagination: {
                total: totalTracks,
                page,
                totalPages: Math.ceil(totalTracks / limit),
            },
        };
    }

    // Create new track
    async createTrack(data, currentUser) {
        if (!currentUser || currentUser.role !== "admin") {
            throw new ApiError(403, "Unauthorized");
        }

        const course = await Course.findByPk(data.course_id);
        if (!course) throw new Error("Không tìm thấy khóa học");

        const courseTracks = await Track.findAll({
            where: { course_id: data.course_id },
            order: [["position", "DESC"]],
            limit: 1,
        });

        const lastPosition =
            courseTracks.length > 0 ? courseTracks[0].position : 0;

        const track = await Track.create({
            ...data,
            position: lastPosition + 1,
        });

        if (course) {
            await course.increment("total_track");
        }

        return track;
    }

    // Update track
    async updateTrack(id, data, currentUser) {
        if (!currentUser || currentUser.role !== "admin") {
            throw new ApiError(403, "Unauthorized");
        }
        const track = await Track.findByPk(id);
        if (!track) return null;

        return await track.update(data);
    }

    // Delete track
    async deleteTrack(id, currentUser) {
        if (!currentUser || currentUser.role !== "admin") {
            throw new ApiError(403, "Unauthorized");
        }
        const track = await Track.findByPk(id);
        if (!track) return false;

        await track.destroy();
        return true;
    }

    // Update track positions
    async updatePositions(tracks, currentUser) {
        if (!currentUser || currentUser.role !== "admin") {
            throw new ApiError(403, "Unauthorized");
        }

        const transaction = await sequelize.transaction();

        try {
            // Get all track IDs to update
            const trackIds = tracks.map((t) => t.id);
            // Fetch all tracks to verify course_id
            const existingTracks = await Track.findAll({
                where: { id: trackIds },
                transaction,
            });

            // Verify all tracks exist and belong to the same course
            if (existingTracks.length !== trackIds.length) {
                throw new Error("Một hoặc nhiều chương không tồn tại");
            }

            const courseId = existingTracks[0].course_id;
            const allSameCourse = existingTracks.every(
                (track) => track.course_id === courseId
            );

            if (!allSameCourse) {
                throw new Error(
                    "Chỉ có thể sắp xếp các chương trong cùng một khóa học"
                );
            }

            // Update positions
            await Promise.all(
                tracks.map(async (track, index) => {
                    await Track.update(
                        { position: index + 1 },
                        {
                            where: { id: track.id },
                            transaction,
                        }
                    );
                })
            );

            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

module.exports = new TracksService();
