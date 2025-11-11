const { Note, User, Lesson, Track, Course } = require("@models");

/**
 * Get notes for a lesson with user, lesson, track and course info
 * returns list of notes ordered by created_at desc
 */
const getByLesson = async ({
    lessonId,
    limit = 50,
    offset = 0,
    currentUser,
}) => {
    if (!lessonId) throw new Error("lessonId is required");

    const notes = await Note.findAll({
        where: {
            lesson_id: lessonId,
        },
        limit: +limit,
        offset: +offset,
        order: [["created_at", "DESC"]],
        include: [
            {
                model: User,
                as: "user",
                attributes: ["id", "full_name", "username", "avatar"],
            },
            {
                model: Lesson,
                as: "lesson",
                attributes: ["id", "title"],
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
            },
        ],
    });

    // Return plain objects
    return notes.map((n) => n.toJSON());
};

const create = async (data, currentUser) => {
    if (!currentUser)
        throw new Error("Bạn cần đăng nhập trước khi thêm ghi chú");
    if (!data.lesson_id && !data.lessonId)
        throw new Error("lesson_id is required");
    if (!data.content) throw new Error("content is required");

    const lessonId = data.lesson_id || data.lessonId;

    // Validate lesson exists to avoid foreign key DB errors
    const lesson = await Lesson.findByPk(lessonId, {
        include: [
            {
                model: Track,
                as: "track",
                include: [{ model: Course, as: "course" }],
            },
        ],
    });

    if (!lesson) {
        throw new Error("Lesson không tồn tại");
    }

    const note = await Note.create({
        user_id: currentUser.id,
        lesson_id: lessonId,
        content: data.content,
        video_timestamp: data.video_timestamp || data.time || 0,
        is_pinned: data.is_pinned || false,
    });

    // include associations for response
    const created = await Note.findByPk(note.id, {
        include: [
            {
                model: User,
                as: "user",
                attributes: ["id", "full_name", "username", "avatar"],
            },
            {
                model: Lesson,
                as: "lesson",
                attributes: ["id", "title"],
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
            },
        ],
    });

    return created.toJSON();
};

const update = async (noteId, data, currentUser) => {
    if (!currentUser)
        throw new Error("Bạn cần đăng nhập trước khi sửa ghi chú");

    const note = await Note.findByPk(noteId);
    if (!note) throw new Error("Note không tồn tại");
    if (note.user_id !== currentUser.id)
        throw new Error("Bạn không có quyền sửa ghi chú này");

    if (data.content !== undefined) note.content = data.content;
    if (data.video_timestamp !== undefined)
        note.video_timestamp = data.video_timestamp;
    if (data.is_pinned !== undefined) note.is_pinned = data.is_pinned;

    await note.save();

    const updated = await Note.findByPk(note.id, {
        include: [
            {
                model: User,
                as: "user",
                attributes: ["id", "full_name", "username", "avatar"],
            },
            {
                model: Lesson,
                as: "lesson",
                attributes: ["id", "title"],
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
            },
        ],
    });

    return updated.toJSON();
};

const remove = async (noteId, currentUser) => {
    if (!currentUser)
        throw new Error("Bạn cần đăng nhập trước khi xóa ghi chú");

    const note = await Note.findByPk(noteId);
    if (!note) throw new Error("Note không tồn tại");
    if (note.user_id !== currentUser.id)
        throw new Error("Bạn không có quyền xóa ghi chú này");

    await note.destroy();
    return;
};

const getAll = async ({
    currentUser,
    lessonId,
    courseId,
    limit = 50,
    offset = 0,
}) => {
    if (!currentUser) throw new Error("Bạn cần đăng nhập trước");

    const where = { user_id: currentUser.id };
    if (lessonId) where.lesson_id = lessonId;

    // If courseId is provided, filter notes by the course the lesson belongs to
    if (courseId) {
        // Use nested JSON filtering via $-path. Sequelize supports this when includes are present.
        where["$lesson.track.course.id$"] = courseId;
    }

    const notes = await Note.findAll({
        where,
        limit: +limit,
        offset: +offset,
        order: [["created_at", "DESC"]],
        include: [
            {
                model: User,
                as: "user",
                attributes: ["id", "full_name", "username", "avatar"],
            },
            {
                model: Lesson,
                as: "lesson",
                attributes: ["id", "title"],
                required: !!courseId, // ensure join when filtering by course
                include: [
                    {
                        model: Track,
                        as: "track",
                        attributes: ["id", "title"],
                        required: !!courseId,
                        include: [
                            {
                                model: Course,
                                as: "course",
                                attributes: ["id", "title"],
                                required: !!courseId,
                            },
                        ],
                    },
                ],
            },
        ],
    });

    return notes.map((n) => n.toJSON());
};

module.exports = { getByLesson, getAll, create, update, remove };
