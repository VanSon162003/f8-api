const postsService = require("@/service/posts.service");
const response = require("@/utils/response");

const getPopular = async (req, res) => {
    try {
        const data = await postsService.getPopular();

        response.success(res, 200, data);
    } catch (error) {
        response.error(res, 500, error.message);
    }
};

module.exports = {
    getPopular,
};
