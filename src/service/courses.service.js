const { Course, User, Video, Track, Lesson } = require("@models");
const { where } = require("sequelize");

const getAll = async () => {
    try {
        const courses = await Course.findAll({
            include: [
                {
                    model: User,
                    as: "creator",
                    attributes: ["id", "full_name", "username", "avatar"],
                },

                {
                    model: User,
                    as: "users",
                    attributes: ["id", "full_name", "username", "avatar"],
                },
            ],
        });
        return courses;
    } catch (error) {
        throw new Error(error);
    }
};

const getBySlug = async (
    slug,
    currentUser,
    trackOffset = 0,
    trackLimit = 10
) => {
    try {
        const course = await Course.findOne({ where: { slug } });
        if (!course) return null;

        const tracks = await Track.findAll({
            where: { course_id: course.id },
            include: [
                {
                    model: Lesson,
                    as: "lessons",
                    include: {
                        model: User,
                        as: "users",
                        attributes: ["id"],
                        where: {
                            id: currentUser?.id || 0,
                        },
                        required: false,
                    },
                },
            ],
            order: [
                ["position", "ASC"],
                [{ model: Lesson, as: "lessons" }, "position", "ASC"],
            ],
            offset: +trackOffset,
            limit: +trackLimit,
        });

        const users = await User.findOne({
            where: { id: currentUser?.id || 0 },
            include: {
                model: Course,
                as: "coursesProgress",
                where: { id: course.id },
            },
        });

        return {
            ...course.toJSON(),
            tracks,
            userProgress: users?.coursesProgress || [],
        };
    } catch (error) {
        throw new Error(error);
    }
};

const getAllVideos = async (limit = 8) => {
    try {
        const videos = await Video.findAll({
            limit,
        });
        return videos;
    } catch (error) {
        throw new Error(error);
    }
};

const registerCourse = async (currentUser, courseId) => {
    try {
        if (!currentUser)
            throw new Error("Bạn cần đăng nhập trước khi đăng ký khoá học");

        const course = await Course.findByPk(courseId, {
            include: {
                model: Track,
                as: "tracks",
                order: [["position", "ASC"]],
                limit: 1,
                include: {
                    model: Lesson,
                    as: "lessons",
                    order: [["position", "ASC"]],
                    limit: 1,
                },
            },
        });

        if (!course) throw new Error("khoá học không tồn tại");

        const userHasCourse = await currentUser.hasCourse(course);

        if (userHasCourse) throw new Error("Bạn đã đăng ký khoá học này rồi");

        await currentUser.addCourse(course);

        await currentUser.addLesson(course.tracks[0].lessons[0].id);

        await currentUser.addCoursesProgress(course, {
            through: {
                current_lesson_id: course.tracks[0].lessons[0].id,
            },
        });

        return true;
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = { getAll, getAllVideos, getBySlug, registerCourse };
