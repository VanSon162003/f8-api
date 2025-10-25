const response = require("@/utils/response");
const service = require("@/service/api/learningPaths.service");

const list = async (req, res) => {
    try {
        const data = await service.list(req.user || null);
        response.success(res, 200, data);
    } catch (e) {
        response.error(res, 500, e.message);
    }
};

const getBySlug = async (req, res) => {
    try {
        const data = await service.getBySlug(req.params.slug, req.user || null);
        if (!data) return response.error(res, 404, "Learning path not found");
        response.success(res, 200, data);
    } catch (e) {
        response.error(res, 500, e.message);
    }
};

module.exports = { list, getBySlug };
