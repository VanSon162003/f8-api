const {
    Course,
    User,
    Video,
    Track,
    Lesson,
    UserLesson,
    UserCourseProgress,
} = require("@models");
const { json } = require("express");
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

const getByUser = async (currentUser) => {
    if (!currentUser) {
        throw new Error("Bạn cần đăng nhập để lấy khoá học của mình");
    }

    try {
        const courses = await currentUser.getCourses({
            include: [
                {
                    model: User,
                    as: "creator",
                    attributes: ["id", "full_name", "username", "avatar"],
                },
                {
                    model: UserCourseProgress,
                    as: "userProgress",
                    attributes: ["id", "last_view_at", "progress"],
                },
            ],
        });

        return courses;
    } catch (error) {
        console.error(error);
        throw new Error("Không thể lấy danh sách khóa học");
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

            // Cập nhật UserCourseProgress: thêm lesson vào learned_lessons và tính progress
            try {
                // Tìm lesson kèm track và course
                const lesson = await Lesson.findByPk(lessonId, {
                    include: {
                        model: Track,
                        as: "track",
                        include: {
                            model: Course,
                            as: "course",
                        },
                    },
                });

                if (lesson && lesson.track && lesson.track.course) {
                    const course = lesson.track.course;

                    // Tìm hoặc tạo UserCourseProgress cho user-course
                    const [userCourseProgress, ucpCreated] =
                        await UserCourseProgress.findOrCreate({
                            where: {
                                user_id: currentUser.id,
                                course_id: course.id,
                            },
                            defaults: {
                                user_id: currentUser.id,
                                course_id: course.id,
                                current_lesson_id: lessonId,
                                learned_lessons: [lessonId],
                                progress: 0,
                            },
                        });

                    // Parse existing learned_lessons as array
                    let learned = Array.isArray(
                        JSON.parse(userCourseProgress.learned_lessons)
                    )
                        ? JSON.parse(userCourseProgress.learned_lessons)
                        : [];

                    // Nếu lessonId chưa có trong mảng thì thêm vào
                    if (!learned.includes(lessonId)) {
                        learned.push(lessonId);
                    }

                    // Lấy tổng số bài của khoá học
                    const tracks = await getTracksByCourseId(course.id);
                    const totalLessons =
                        tracks.flatMap((t) => t.lessons).length || 0;

                    // Tính progress (%): số learned / tổng * 100
                    const progress =
                        totalLessons > 0
                            ? (learned.length / totalLessons) * 100
                            : 0;

                    // Gắn is_completed nếu progress >= 100
                    const isCompleted = progress >= 100;

                    // Xác định bài học tiếp theo theo thứ tự track.position -> lesson.position
                    let nextLessonId = null;
                    try {
                        // đảm bảo tracks được sắp xếp theo position
                        const courseTracks = await getTracksByCourseId(
                            course.id
                        );
                        const orderedTracks = (courseTracks || [])
                            .slice()
                            .sort(
                                (a, b) => (a.position || 0) - (b.position || 0)
                            );
                        const allLessonsOrdered = orderedTracks.flatMap((t) =>
                            (t.lessons || [])
                                .slice()
                                .sort(
                                    (a, b) =>
                                        (a.position || 0) - (b.position || 0)
                                )
                        );

                        const currentIndex = allLessonsOrdered.findIndex(
                            (l) => l.id === lessonId
                        );
                        if (
                            currentIndex >= 0 &&
                            currentIndex < allLessonsOrdered.length - 1
                        ) {
                            nextLessonId =
                                allLessonsOrdered[currentIndex + 1].id;
                        }
                    } catch (err) {
                        // ignore ordering errors, fallback will use current lessonId
                        console.debug("Failed to compute nextLessonId:", err);
                    }

                    // Cập nhật record (nếu có nextLessonId thì set current_lesson_id sang next)
                    await userCourseProgress.update({
                        learned_lessons: learned,
                        progress,
                        is_completed: isCompleted,
                        current_lesson_id: nextLessonId || lessonId,
                        last_viewed_at: new Date(),
                    });
                }
            } catch (err) {
                // Không làm crash flow chính; log để debug
                console.error("Failed to update UserCourseProgress:", err);
            }
        }
        return userLesson;
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = {
    getAll,
    getByUser,
    getAllVideos,
    getTracksByCourseId,
    getBySlug,
    registerCourse,
    updateProgress,
    getProgress,
    getUserLessonProgress,
    updateUserLessonProgress,
};
