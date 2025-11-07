const dashboardService = require("@/service/admin/dashboard.service");
const response = require("@/utils/response");

class DashboardController {
    async getDashboardStats(req, res) {
        try {
            const stats = await dashboardService.getDashboardStats();
            response.success(res, 200, stats);
        } catch (error) {
            response.error(res, 400, error);
        }
    }
}

module.exports = new DashboardController();
