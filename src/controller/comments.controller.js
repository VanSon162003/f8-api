const commentsService = require("@/service/comments.service");
const response = require("@/utils/response");

const getAllByType = async (req, res) => {
    const { limit, offset } = req.query;
    const { type, id } = req.params;
    try {
        const data = await commentsService.getAllByType({
            id,
            type,
            limit,
            offset,
            currentUser: req.user,
        });

        response.success(res, 200, data);
    } catch (error) {
        response.error(res, 500, error.message);
    }
};

const create = async (req, res) => {
    try {
        const data = await commentsService.create(req.body, req.user);

        response.success(res, 200, data);
    } catch (error) {
        response.error(res, 500, error.message);
    }
};

const edit = async (req, res) => {
    const commentId = req.params.id;
    const content = req.body.content;
    try {
        const data = await commentsService.edit(commentId, content, req.user);

        response.success(res, 200, data);
    } catch (error) {
        response.error(res, 500, error.message);
    }
};

const remove = async (req, res) => {
    const commentId = req.params.id;
    try {
        const data = await commentsService.remove(commentId, req.user);

        response.success(res, 200, data);
    } catch (error) {
        response.error(res, 500, error.message);
    }
};

const handleReaction = async (req, res) => {
    const commentId = req.params.id;
    try {
        const data = await commentsService.handleReaction(
            commentId,
            req.body.reaction,
            req.user
        );

        response.success(res, 200, data);
    } catch (error) {
        response.error(res, 500, error.message);
    }
};

module.exports = {
    getAllByType,
    edit,
    create,
    remove,
    handleReaction,
};
