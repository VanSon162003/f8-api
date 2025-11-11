const notesService = require("@/service/api/notes.service");
const response = require("@/utils/response");

const getByLesson = async (req, res) => {
    const { lessonId, limit = 50, offset = 0 } = req.query;
    try {
        const data = await notesService.getByLesson({
            lessonId,
            limit,
            offset,
            currentUser: req.user,
        });

        response.success(res, 200, data);
    } catch (error) {
        response.error(res, 500, error.message || error);
    }
};

// Get all notes for current user (optionally filter by lessonId or courseId)
const getAll = async (req, res) => {
    const { limit = 50, offset = 0, lessonId, courseId } = req.query;
    try {
        const data = await notesService.getAll({
            currentUser: req.user,
            lessonId,
            courseId,
            limit,
            offset,
        });

        response.success(res, 200, data);
    } catch (error) {
        response.error(res, 500, error.message || error);
    }
};

const create = async (req, res) => {
    try {
        const data = await notesService.create(req.body, req.user);

        response.success(res, 200, data);
    } catch (error) {
        response.error(res, 500, error.message || error);
    }
};

const update = async (req, res) => {
    const noteId = req.params.id;
    try {
        const data = await notesService.update(noteId, req.body, req.user);

        response.success(res, 200, data);
    } catch (error) {
        response.error(res, 500, error.message || error);
    }
};

const remove = async (req, res) => {
    const noteId = req.params.id;
    try {
        await notesService.remove(noteId, req.user);

        response.success(res, 200, { message: "Deleted" });
    } catch (error) {
        response.error(res, 500, error.message || error);
    }
};

module.exports = { getByLesson, getAll, create, update, remove };
