const { User, Course, Post, Payment, sequelize } = require("../../db/models");
const { Op } = require("sequelize");

class DashboardService {
    async getDashboardStats() {
        try {
            const [totalUsers, totalCourses, totalPosts, monthlyRevenue] =
                await Promise.all([
                    // Get total users
                    User.count(),

                    // Get total courses
                    Course.count(),

                    // Get total posts
                    Post.count({
                        where: {
                            is_approved: true,
                        },
                    }),

                    // Get monthly revenue for the current year
                    Payment.findAll({
                        attributes: [
                            [
                                sequelize.fn(
                                    "MONTH",
                                    sequelize.col("created_at")
                                ),
                                "month",
                            ],
                            [
                                sequelize.fn(
                                    "YEAR",
                                    sequelize.col("created_at")
                                ),
                                "year",
                            ],
                            [
                                sequelize.fn("SUM", sequelize.col("amount")),
                                "total",
                            ],
                        ],
                        where: {
                            status: "succeeded",
                            created_at: {
                                [Op.gte]: new Date(
                                    new Date().getFullYear(),
                                    0,
                                    1
                                ), // From January 1st of current year
                            },
                        },
                        group: [
                            sequelize.fn("MONTH", sequelize.col("created_at")),
                            sequelize.fn("YEAR", sequelize.col("created_at")),
                        ],
                        order: [
                            [
                                sequelize.fn(
                                    "MONTH",
                                    sequelize.col("created_at")
                                ),
                                "ASC",
                            ],
                        ],
                        raw: true,
                    }),
                ]);

            // Format monthly revenue data
            const monthlyRevenueData = Array.from({ length: 12 }, (_, i) => {
                const monthData = monthlyRevenue.find(
                    (item) => parseInt(item.month) === i + 1
                );
                return {
                    month: i + 1,
                    revenue: monthData ? parseFloat(monthData.total) : 0,
                };
            });

            return {
                stats: {
                    total_users: totalUsers,
                    total_courses: totalCourses,
                    total_posts: totalPosts,
                },
                monthly_revenue: monthlyRevenueData,
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new DashboardService();
