const { Course, User, Sequelize } = require("@models");
const { Op } = Sequelize;
const fs = require("fs");
const path = require("path");
const ApiError = require("@utils/ApiError");

exports.getAllCourses = async (
    currentUser,
    page = 1,
    limit = 10,
    search = ""
) => {
    if (!currentUser || currentUser.role !== "admin") {
        throw new ApiError(403, "Unauthorized");
    }

    const offset = (page - 1) * limit;
    const whereClause = search
        ? {
              title: {
                  [Op.like]: `%${search}%`,
              },
          }
        : {};

    const { count, rows: courses } = await Course.findAndCountAll({
        where: whereClause,
        include: [
            {
                model: User,
                as: "creator",
                attributes: ["id", "email", "full_name"],
            },
        ],

        order: [["created_at", "ASC"]],
        offset: offset,
        limit: limit,
    });

    const totalPages = Math.ceil(count / limit);

    return {
        courses,
        pagination: {
            currentPage: page,
            totalPages,
            pageSize: limit,
            totalItems: count,
            hasMore: page < totalPages,
        },
    };
};

exports.createCourse = async (courseData, currentUser) => {
    if (!currentUser || currentUser.role !== "admin") {
        throw new ApiError(403, "Unauthorized");
    }
    if (!courseData.title) {
        throw new ApiError(400, "Tiêu đề là bắt buộc");
    }
    if (!courseData.description) {
        throw new ApiError(400, "Mô tả là bắt buộc");
    }
    if (!courseData.price && courseData.price !== 0) {
        throw new ApiError(400, "Giá là bắt buộc");
    }
    if (!courseData.what_you_learn) {
        throw new ApiError(400, "Nội dung học là bắt buộc");
    }
    if (!courseData.requirement) {
        throw new ApiError(400, "Yêu cầu là bắt buộc");
    }
    if (!courseData.level) {
        throw new ApiError(400, "Cấp độ là bắt buộc");
    }

    let thumbnail = courseData.thumbnail;

    if (thumbnail) {
        const srcDir = path.join(__dirname, "../../uploads/imgs");
        if (!fs.existsSync(srcDir)) {
            fs.mkdirSync(srcDir, { recursive: true });
        }

        const ext = path.extname(thumbnail.originalname);
        const basename = path.basename(thumbnail.originalname, ext);
        const filename = `${basename}-${Date.now()}${ext}`;
        const destPath = path.join(srcDir, filename);

        fs.copyFileSync(thumbnail.path, destPath);
        thumbnail = `uploads/imgs/${filename}`.replace(/\\/g, "/");
    } else {
        // Nếu không upload mới, giữ nguyên ảnh cũ
        thumbnail = course.thumbnail;
    }
    // Set default values
    courseData.status = "draft";
    courseData.is_pro = courseData.price > 0;
    courseData.creator_id = currentUser.id;
    courseData.thumbnail = thumbnail;

    const dataCreate = {
        ...courseData,
        price: parseFloat(courseData.price),
        old_price: courseData.old_price ? parseFloat(courseData.old_price) : 0,
        what_you_learn: Array.isArray(courseData.what_you_learn)
            ? courseData.what_you_learn
            : JSON.parse(courseData.what_you_learn),
        requirement: Array.isArray(courseData.requirement)
            ? courseData.requirement
            : JSON.parse(courseData.requirement),
    };

    const course = await Course.create(dataCreate);
    return course;
};

exports.editCourse = async (id, updateData) => {
    const course = await Course.findByPk(id);
    if (!course) {
        throw new ApiError(404, "Không tìm thấy khóa học");
    }

    // Validate required fields
    if (!updateData.title) {
        throw new ApiError(400, "Tiêu đề là bắt buộc");
    }
    if (!updateData.description) {
        throw new ApiError(400, "Mô tả là bắt buộc");
    }
    if (!updateData.price && updateData.price !== 0) {
        throw new ApiError(400, "Giá là bắt buộc");
    }
    if (!updateData.what_you_learn) {
        throw new ApiError(400, "Nội dung học là bắt buộc");
    }
    if (!updateData.requirement) {
        throw new ApiError(400, "Yêu cầu là bắt buộc");
    }
    if (!updateData.level) {
        throw new ApiError(400, "Cấp độ là bắt buộc");
    }

    let thumbnail = updateData.thumbnail;

    if (thumbnail) {
        const srcDir = path.join(__dirname, "../../uploads/imgs");
        if (!fs.existsSync(srcDir)) {
            fs.mkdirSync(srcDir, { recursive: true });
        }

        const ext = path.extname(thumbnail.originalname);
        const basename = path.basename(thumbnail.originalname, ext);
        const filename = `${basename}-${Date.now()}${ext}`;
        const destPath = path.join(srcDir, filename);

        fs.copyFileSync(thumbnail.path, destPath);
        thumbnail = `uploads/imgs/${filename}`.replace(/\\/g, "/");
    } else {
        // Nếu không upload mới, giữ nguyên ảnh cũ
        thumbnail = course.thumbnail;
    }

    // Prepare update data
    const dataToUpdate = {
        ...updateData,
        thumbnail,
        price: parseFloat(updateData.price),
        old_price: updateData.old_price ? parseFloat(updateData.old_price) : 0,
        is_pro: updateData.is_pro === "true" || updateData.is_pro === true,
        what_you_learn: Array.isArray(updateData.what_you_learn)
            ? updateData.what_you_learn
            : JSON.parse(updateData.what_you_learn),
        requirement: Array.isArray(updateData.requirement)
            ? updateData.requirement
            : JSON.parse(updateData.requirement),
    };

    // If there's a new thumbnail and old thumbnail exists, delete old thumbnail

    await course.update(dataToUpdate);
    return course;
};

exports.updateCourseStatus = async (id, status) => {
    const course = await Course.findByPk(id);
    if (!course) {
        throw new ApiError(404, "Không tìm thấy khóa học");
    }

    await course.update({ status });
    return course;
};

exports.removeCourse = async (id) => {
    const course = await Course.findByPk(id);
    if (!course) {
        throw new ApiError(404, "Không tìm thấy khóa học");
    }

    // Delete thumbnail if exists
    if (course.thumbnail) {
        try {
            await fs.unlink(
                path.join(__dirname, "../../uploads", course.thumbnail)
            );
        } catch (error) {
            console.error("Error deleting thumbnail:", error);
        }
    }

    await course.destroy();
};
