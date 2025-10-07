const response = require("../../utils/response");

const notFoundHandle = (req, res) => {
    response.error(res, 404, "Resource not found");
};

module.exports = notFoundHandle;
