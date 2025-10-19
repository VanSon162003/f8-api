const notificationsService = require("@/service/notifications.service");
const response = require("@/utils/response");

exports.read = async (req, res) => {
    try {
        const data = await notificationsService.read(req.body, req.user);

        response.success(res, 200, data);
    } catch (error) {
        console.log(error);

        response.error(res, 400, error);
    }
};
