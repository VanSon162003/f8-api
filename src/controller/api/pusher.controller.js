const pusherService = require("@/service/api/pusher.service");
const response = require("@/utils/response");

exports.sendMessage = async (req, res) => {
    try {
        const newMessage = await pusherService.sendMessage(req.body, req.user);

        response.success(res, 200, newMessage);
    } catch (error) {
        response.error(res, 400, error);
    }
};
