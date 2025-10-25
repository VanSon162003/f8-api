const { User } = require("@/db/models");
const { Op } = require("sequelize");

const getAll = async (limit = 10, offset = 0, searchQuery = "") => {
    // Tìm tổng số users và danh sách users theo điều kiện
    const { count, rows } = await User.findAndCountAll({
        limit,
        offset,
        where: searchQuery
            ? {
                  [Op.or]: [
                      {
                          email: {
                              [Op.like]: `%${searchQuery}%`,
                          },
                      },
                      {
                          full_name: {
                              [Op.like]: `%${searchQuery}%`,
                          },
                      },
                  ],
              }
            : {},
        attributes: [
            "id",
            "email",
            "full_name",
            "status",
            "role",
            "created_at",
        ],
        order: [["created_at", "ASC"]],
    });

    // Tính toán thông tin pagination
    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(count / limit);

    return {
        data: rows,
        meta: {
            total: count,
            currentPage: currentPage,
            totalPages: totalPages,
            hasNextPage: currentPage < totalPages,
            hasPrevPage: currentPage > 1,
        },
    };
};

const updateUser = async (id, updateData) => {
    const user = await User.findByPk(id);

    if (!user) {
        throw new Error("User not found");
    }

    // Chỉ cho phép cập nhật role và status
    const allowedUpdates = {};
    if (updateData.role) {
        if (!["user", "admin", "instructor"].includes(updateData.role)) {
            throw new Error("Invalid role");
        }
        allowedUpdates.role = updateData.role;
    }
    if (updateData.status) {
        if (!["active", "inactive"].includes(updateData.status)) {
            throw new Error("Invalid status");
        }
        allowedUpdates.status = updateData.status;
    }

    await user.update(allowedUpdates);

    return {
        data: user,
        message: "User updated successfully",
    };
};

module.exports = {
    getAll,
    updateUser,
};
