const settingsService = require("@/service/admin/settings.service");
const response = require("@/utils/response");

class SettingsController {
    async getSettings(req, res) {
        try {
            const settings = await settingsService.getSettings();
            response.success(res, 200, settings);
        } catch (error) {
            response.error(res, 400, error.message);
        }
    }

    async updateSettings(req, res) {
        try {
            const data = req.body;
            const logo = req.file;
            const settings = await settingsService.updateSettings(data, logo);
            response.success(res, 200, settings);
        } catch (error) {
            response.error(res, 400, error.message);
        }
    }
}

module.exports = new SettingsController();
