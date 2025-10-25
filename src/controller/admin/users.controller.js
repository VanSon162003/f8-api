const userServiceManager = require("@/service/admin/users.service");
const response = require("@/utils/response");

const getAll = async (req, res) => {
    try {
        const { limit, offset, search } = req.query;
        const data = await userServiceManager.getAll(
            +limit,
            +offset,
            search,
            req.user
        );
        response.success(res, 200, data);
    } catch (error) {
        response.error(res, 500, error.message);
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, status } = req.body;
        const data = await userServiceManager.updateUser(
            id,
            { role, status },
            req.user
        );
        response.success(res, 200, data);
    } catch (error) {
        response.error(res, 500, error.message);
    }
};

module.exports = {
    getAll,
    updateUser,
};
