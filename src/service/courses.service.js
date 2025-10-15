const {
    Course,
    User,
    Video,
    Track,
    Lesson,
    UserLesson,
    UserCourseProgress,
} = require("@models");
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

        // Ghi nhận hoạt động đăng ký khoá học
        const { updateUserActivity } = require("./auth.service");
        await updateUserActivity(currentUser.id, "register_course");

        return true;
    } catch (error) {
        throw new Error(error);
    }
};

const getTracksByCourseId = async (id) => {
    const tracks = await Track.findAll({
        where: { course_id: id },
        include: [
            {
                model: Lesson,
                as: "lessons",
            },
        ],
    });

    return tracks;
};

const getProgress = async (currentUser, courseId) => {
    if (!currentUser) {
        throw new Error("Bạn cần đăng nhập trước khi lấy ra progress");
    }
    const tracks = await getTracksByCourseId(courseId);

    const totalLessonByCourse = tracks.flatMap((item) => item.lessons).length;

    const course = await Course.findOne({
        where: {
            id: courseId,
        },
        attributes: ["id"],
        include: {
            model: UserCourseProgress,
            as: "userProgress",
            where: {
                user_id: currentUser?.id || 0,
            },
        },
    });

    return {
        ...course.toJSON(),
        totalLessonByCourse,
    };
};

const updateProgress = async () => {};

const getUserLessonProgress = async (currentUser, courseId) => {
    try {
        if (!currentUser) {
            throw new Error("Bạn cần đăng nhập trước khi lấy ra progress");
        }

        const course = await Course.findOne({
            where: { id: courseId },
            include: {
                model: Track,
                as: "tracks",
                include: {
                    model: Lesson,
                    as: "lessons",
                    include: {
                        model: UserLesson,
                        as: "userLessons",
                        where: { user_id: currentUser.id },
                        required: false,
                    },
                },
            },
        });

        if (!course) {
            throw new Error("Khóa học không tồn tại");
        }

        return course;
    } catch (error) {
        throw new Error(error);
    }
};

const updateUserLessonProgress = async (
    currentUser,
    lessonId,
    progressData
) => {
    try {
        if (!currentUser) {
            throw new Error("Bạn cần đăng nhập trước khi cập nhật progress");
        }

        const { watchDuration, lastPosition, completed } = progressData;

        // Tìm hoặc tạo UserLesson record
        const [userLesson, created] = await UserLesson.findOrCreate({
            where: {
                user_id: currentUser.id,
                lesson_id: lessonId,
            },
            defaults: {
                user_id: currentUser.id,
                lesson_id: lessonId,
                watch_duration: watchDuration || 0,
                last_position: lastPosition || 0,
                completed: completed || false,
                completed_at: completed ? new Date() : null,
            },
        });

        if (!created) {
            // Cập nhật existing record
            await userLesson.update({
                watch_duration: watchDuration || userLesson.watch_duration,
                last_position: lastPosition || userLesson.last_position,
                completed:
                    completed !== undefined ? completed : userLesson.completed,
                completed_at: completed ? new Date() : userLesson.completed_at,
            });
        }

        // Nếu hoàn thành bài học thì ghi nhận hoạt động
        if (completed) {
            const { updateUserActivity } = require("./auth.service");
            await updateUserActivity(currentUser.id, "complete_lesson");
        }
        return userLesson;
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = {
    getAll,
    getAllVideos,
    getTracksByCourseId,
    getBySlug,
    registerCourse,
    updateProgress,
    getProgress,
    getUserLessonProgress,
    updateUserLessonProgress,
};
