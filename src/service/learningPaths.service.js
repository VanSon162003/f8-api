const {
    LearningPath,
    Course,
    Track,
    Lesson,
    UserLesson,
    UserCourseProgress,
} = require("@models");

const list = async (currentUser = null) => {
    const learningPaths = await LearningPath.findAll({
        include: {
            model: Course,
            as: "courses",
            through: { attributes: [] },
        },
        order: [["created_at", "DESC"]],
    });

    const learningPathsJson = learningPaths.map((lp) => lp.toJSON());

    // Load toàn bộ enrolled course id một lần
    const enrolledCourses = currentUser
        ? (await currentUser.getCourses({ attributes: ["id"] })).map(
              (c) => c.id
          )
        : [];

    const result = [];

    for (const lp of learningPathsJson) {
        const coursesWithProgress = await Promise.all(
            (lp.courses || []).map(async (course) => {
                const totalLessons = await Lesson.count({
                    include: [
                        {
                            model: Track,
                            as: "track",
                            where: { course_id: course.id },
                        },
                    ],
                });

                let completedLessons = 0;
                if (currentUser) {
                    completedLessons = await UserLesson.count({
                        where: { user_id: currentUser.id, completed: true },
                        include: [
                            {
                                model: Lesson,
                                as: "lesson",
                                include: [
                                    {
                                        model: Track,
                                        as: "track",
                                        where: { course_id: course.id },
                                    },
                                ],
                            },
                        ],
                    });
                }

                const progressPercent =
                    totalLessons > 0
                        ? Math.round((completedLessons / totalLessons) * 100)
                        : 0;

                const enrolled = enrolledCourses.includes(course.id);

                return { ...course, progressPercent, enrolled };
            })
        );

        result.push({ ...lp, courses: coursesWithProgress });
    }

    return result;
};

const getBySlug = async (slug, currentUser = null) => {
    const lp = await LearningPath.findOne({
        where: { slug },
        include: [
            {
                model: Course,
                as: "courses",
                through: { attributes: [] },

                include: {
                    model: UserCourseProgress,
                    as: "userProgress",
                    required: false,
                },
            },
        ],
    });

    if (!lp) return null;

    const lpJson = lp.toJSON();

    // 🔹 Load tất cả course_id mà user đã ghi danh (chỉ 1 truy vấn)
    const enrolledCourses = currentUser
        ? (await currentUser.getCourses({ attributes: ["id"] })).map(
              (c) => c.id
          )
        : [];

    // console.log();

    // 🔹 Duyệt qua các khóa học và xử lý song song (Promise.all)
    const coursesWithProgress = await Promise.all(
        (lpJson.courses || []).map(async (course) => {
            // Đếm tổng số bài học trong course
            const totalLessons = await Lesson.count({
                include: [
                    {
                        model: Track,
                        as: "track",
                        where: { course_id: course.id },
                    },
                ],
            });

            // Đếm số bài user đã hoàn thành
            let completedLessons = 0;
            if (currentUser) {
                completedLessons = await UserLesson.count({
                    where: { user_id: currentUser.id, completed: true },
                    include: [
                        {
                            model: Lesson,
                            as: "lesson",
                            include: [
                                {
                                    model: Track,
                                    as: "track",
                                    where: { course_id: course.id },
                                },
                            ],
                        },
                    ],
                });
            }

            // Tính tiến độ %
            const progressPercent =
                totalLessons > 0
                    ? Math.round((completedLessons / totalLessons) * 100)
                    : 0;

            // Xác định đã ghi danh hay chưa
            const enrolled = enrolledCourses.includes(course.id);

            return { ...course, progressPercent, enrolled };
        })
    );

    return { ...lpJson, courses: coursesWithProgress };
};

module.exports = { list, getBySlug };
