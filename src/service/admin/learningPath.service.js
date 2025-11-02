const { Op } = require("sequelize");
const { LearningPath, Course, LearningPathCourse } = require("../../db/models");
const fs = require("fs").promises;
const path = require("path");

class LearningPathService {
    // Get all learning paths with pagination and search
    async getAllLearningPaths(page, limit, search) {
        const offset = (page - 1) * limit;
        const where = search
            ? {
                  [Op.or]: [
                      { title: { [Op.like]: `%${search}%` } },
                      { description: { [Op.like]: `%${search}%` } },
                  ],
              }
            : {};

        const { count, rows: learning_paths } =
            await LearningPath.findAndCountAll({
                where,
                include: [
                    {
                        model: Course,
                        as: "courses",
                        through: { attributes: [] }, // Exclude junction table attributes
                    },
                ],
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [["created_at", "DESC"]],
            });

        return {
            learning_paths,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit),
            },
        };
    }

    // Get learning path by ID
    async getLearningPathById(id) {
        const learningPath = await LearningPath.findByPk(id, {
            include: [
                {
                    model: Course,
                    as: "courses",
                    through: { attributes: [] },
                },
            ],
        });

        if (!learningPath) {
            throw new Error("Learning path not found");
        }

        return learningPath;
    }

    // Create new learning path
    async createLearningPath(data, thumbnail) {
        let thumbnailPath = null;
        if (thumbnail) {
            const srcDir = path.join(__dirname, "../../uploads/imgs");
            try {
                await fs.access(srcDir);
            } catch {
                await fs.mkdir(srcDir, { recursive: true });
            }

            const ext = path.extname(thumbnail.originalname);
            const basename = path.basename(thumbnail.originalname, ext);
            const filename = `${basename}-${Date.now()}${ext}`;
            const destPath = path.join(srcDir, filename);

            await fs.copyFile(thumbnail.path, destPath);
            thumbnailPath = `uploads/imgs/${filename}`.replace(/\\/g, "/");
        }

        const learningPath = await LearningPath.create({
            title: data.title,
            description: data.description,
            thumbnail: thumbnailPath,
        });

        return this.getLearningPathById(learningPath.id);
    }

    // Update learning path
    async updateLearningPath(id, data, thumbnail) {
        const learningPath = await this.getLearningPathById(id);
        let thumbnailPath = learningPath.thumbnail;

        if (thumbnail) {
            const srcDir = path.join(__dirname, "../../uploads/imgs");
            try {
                await fs.access(srcDir);
            } catch {
                await fs.mkdir(srcDir, { recursive: true });
            }

            const ext = path.extname(thumbnail.originalname);
            const basename = path.basename(thumbnail.originalname, ext);
            const filename = `${basename}-${Date.now()}${ext}`;
            const destPath = path.join(srcDir, filename);

            // Nếu đã có ảnh cũ, xóa ảnh cũ
            if (learningPath.thumbnail) {
                const oldImagePath = path.join(
                    __dirname,
                    "../../",
                    learningPath.thumbnail
                );
                try {
                    await fs.unlink(oldImagePath);
                } catch (error) {
                    console.error("Error deleting old image:", error);
                }
            }

            await fs.copyFile(thumbnail.path, destPath);
            thumbnailPath = `uploads/imgs/${filename}`.replace(/\\/g, "/");
        }

        await learningPath.update({
            title: data.title,
            description: data.description,
            thumbnail: thumbnailPath,
        });

        return this.getLearningPathById(id);
    }

    // Delete learning path
    async deleteLearningPath(id) {
        const learningPath = await this.getLearningPathById(id);

        if (learningPath.thumbnail) {
            try {
                const imagePath = path.join(
                    __dirname,
                    "../../../uploads/imgs",
                    learningPath.thumbnail
                );
                await fs.unlink(imagePath);
            } catch (error) {
                console.error("Error deleting image:", error);
            }
        }

        // Remove all associated courses first
        await LearningPathCourse.destroy({
            where: { learning_path_id: id },
        });

        // Delete the learning path
        await learningPath.destroy();
    }

    // Add course to learning path
    async addCourseToPath(pathId, courseId, position) {
        const learningPath = await this.getLearningPathById(pathId);
        const course = await Course.findByPk(courseId);

        console.log(course, courseId, 123);

        if (!course) {
            throw new Error("Course not found");
        }

        // Check if the course is already in the learning path
        const existing = await LearningPathCourse.findOne({
            where: {
                learning_path_id: pathId,
                course_id: courseId,
            },
        });

        if (existing) {
            throw new Error("Course is already in the learning path");
        }

        // Add the course to the learning path with the specified position
        await LearningPathCourse.create({
            learning_path_id: pathId,
            course_id: courseId,
            position: position,
        });

        return this.getLearningPathById(pathId);
    }

    // Remove course from learning path
    async removeCourseFromPath(pathId, courseId) {
        const deleted = await LearningPathCourse.destroy({
            where: {
                learning_path_id: pathId,
                course_id: courseId,
            },
        });

        if (!deleted) {
            throw new Error("Course not found in the learning path");
        }
    }

    // Update course position in learning path
    async updateCoursePosition(pathId, courseId, newPosition) {
        const learningPathCourse = await LearningPathCourse.findOne({
            where: {
                learning_path_id: pathId,
                course_id: courseId,
            },
        });

        if (!learningPathCourse) {
            throw new Error("Course not found in the learning path");
        }

        // Update the position
        await learningPathCourse.update({ position: newPosition });

        return this.getLearningPathById(pathId);
    }
}

module.exports = new LearningPathService();
