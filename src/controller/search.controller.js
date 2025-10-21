const response = require("@/utils/response");

const searchService = require("@/service/search.service");
module.exports = {
    index: async (req, res) => {
        const { q } = req.query;
        try {
            const data = await searchService.search(q, { limit: 5 });

            response.success(res, 200, data);
        } catch (error) {
            response.error(res, 500, error.message);
        }
    },
};
