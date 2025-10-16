const { Post, Tag, PostTag, User } = require("@models");
const { Op } = require("sequelize");

const getAllPosts = async (
    page = 1,
    limit = 10,
    status = "published",
    search = ""
) => {
    try {
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (status) {
            whereClause.status = status;
        }

        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { content: { [Op.like]: `%${search}%` } },
                { excerpt: { [Op.like]: `%${search}%` } },
            ];
        }

        const { count, rows } = await Post.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: "author",
                    attributes: ["id", "full_name", "username", "avatar"],
                },
                {
                    model: Tag,
                    as: "tags",
                    through: { attributes: [] },
                    attributes: ["id", "name"],
                },
            ],
            order: [["created_at", "DESC"]],
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true,
        });

        const totalPages = Math.ceil(count / limit);

        return {
            posts: rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: count,
                itemsPerPage: parseInt(limit),
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

const getPostById = async (id) => {
    try {
        const post = await Post.findByPk(id, {
            include: [
                {
                    model: User,
                    as: "author",
                    attributes: ["id", "full_name", "username", "avatar"],
                },
                {
                    model: Tag,
                    as: "tags",
                    through: { attributes: [] },
                    attributes: ["id", "name"],
                },
            ],
        });

        if (!post) {
            throw new Error("Post not found");
        }

        // Increment view count
        await post.increment("views_count");

        return post;
    } catch (error) {
        throw new Error(error.message);
    }
};

const getPostBySlug = async (slug) => {
    try {
        const post = await Post.findOne({
            where: { slug },
            include: [
                {
                    model: User,
                    as: "author",
                    attributes: ["id", "full_name", "username", "avatar"],
                },
                {
                    model: Tag,
                    as: "tags",
                    through: { attributes: [] },
                    attributes: ["id", "name"],
                },
            ],
        });

        if (!post) {
            throw new Error("Post not found");
        }

        // Increment view count
        await post.increment("views_count");

        return post;
    } catch (error) {
        throw new Error(error.message);
    }
};

const fs = require("fs");
const path = require("path");
const { json } = require("express");

const createPost = async (file, postData, authorId) => {
    try {
        const { title, content, description, status, tags, visibility } =
            postData;
        let thumbnail = postData.thumbnail;

        // Nếu có file upload thì lưu vào src/uploads/imgs
        if (file) {
            const srcDir = path.join(__dirname, "../uploads/imgs");
            if (!fs.existsSync(srcDir)) {
                fs.mkdirSync(srcDir, { recursive: true });
            }
            const ext = path.extname(file.originalname);
            const basename = path.basename(file.originalname, ext);
            const filename = `${basename}-${Date.now()}${ext}`;
            const destPath = path.join(srcDir, filename);
            fs.copyFileSync(file.path, destPath);
            thumbnail = `uploads/imgs/${filename}`.replace(/\\/g, "/");
        }

        // Create post
        const post = await Post.create({
            title,
            content,
            description,
            thumbnail,
            status: status || "draft",
            visibility,
            user_id: authorId,
            views_count: 0,
        });

        // Handle tags
        if (tags && tags.length > 0) {
            await handlePostTags(post.id, JSON.parse(tags));
        }

        return post;
    } catch (error) {
        throw new Error(error.message);
    }
};

const updatePost = async (id, file, postData, authorId) => {
    try {
        const post = await Post.findByPk(id);

        if (!post) {
            throw new Error("Post not found");
        }

        // Check if user is the author or admin
        if (post.user_id !== authorId) {
            throw new Error("Unauthorized to update this post");
        }

        const { title, content, description, status, tags } = postData;
        let thumbnail = postData.thumbnail;

        // Nếu có file upload thì lưu vào src/uploads/imgs
        if (file) {
            const srcDir = path.join(__dirname, "../uploads/imgs");
            if (!fs.existsSync(srcDir)) {
                fs.mkdirSync(srcDir, { recursive: true });
            }
            const ext = path.extname(file.originalname);
            const basename = path.basename(file.originalname, ext);
            const filename = `${basename}-${Date.now()}${ext}`;
            const destPath = path.join(srcDir, filename);
            fs.copyFileSync(file.path, destPath);
            thumbnail = `uploads/imgs/${filename}`.replace(/\\/g, "/");
        }

        // Update post
        await post.update({
            title,
            content,
            description,
            thumbnail,
            status,
        });

        // Handle tags if provided
        if (tags !== undefined) {
            await handlePostTags(id, tags);
        }

        // Return updated post with associations
        return await getPostById(id);
    } catch (error) {
        throw new Error(error.message);
    }
};

const deletePost = async (id, authorId) => {
    try {
        const post = await Post.findByPk(id);

        if (!post) {
            throw new Error("Post not found");
        }

        // Check if user is the author or admin
        if (post.user_id !== authorId) {
            throw new Error("Unauthorized to delete this post");
        }

        // Delete associated tags first
        await PostTag.destroy({
            where: { post_id: id },
        });

        // Delete post
        await post.destroy();

        return { message: "Post deleted successfully" };
    } catch (error) {
        throw new Error(error.message);
    }
};

const handlePostTags = async (postId, tagNames = []) => {
    try {
        if (!Array.isArray(tagNames) || tagNames.length === 0) return;

        const cleanTagNames = tagNames
            .map((name) => name.trim().toLowerCase())
            .filter((name) => name.length > 0);

        const existingTags = await Tag.findAll({
            where: {
                name: cleanTagNames,
            },
        });

        const existingTagNames = existingTags.map((tag) => tag.name);

        const newTagNames = cleanTagNames.filter(
            (name) => !existingTagNames.includes(name)
        );

        const newTags = await Promise.all(
            newTagNames.map((name) => Tag.create({ name }))
        );

        const allTags = [...existingTags, ...newTags];

        const post = await Post.findByPk(postId);
        if (!post) throw new Error("Post not found");

        await post.addTags(allTags);

        return allTags;
    } catch (error) {
        console.error("❌ handlePostTags error:", error);
        throw new Error(error.message);
    }
};

const getPostsByTag = async (tagName, page = 1, limit = 10) => {
    try {
        const offset = (page - 1) * limit;

        const tag = await Tag.findOne({ where: { name: tagName } });
        if (!tag) {
            throw new Error("Tag not found");
        }

        const { count, rows } = await Post.findAndCountAll({
            where: { status: "published" },
            include: [
                {
                    model: User,
                    as: "author",
                    attributes: ["id", "full_name", "username", "avatar"],
                },
                {
                    model: Tag,
                    as: "tags",
                    through: { attributes: [] },
                    where: { id: tag.id },
                    attributes: ["id", "name"],
                },
            ],
            order: [["created_at", "DESC"]],
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true,
        });

        const totalPages = Math.ceil(count / limit);

        return {
            posts: rows,
            tag,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: count,
                itemsPerPage: parseInt(limit),
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = {
    getAllPosts,
    getPostById,
    getPostBySlug,
    createPost,
    updatePost,
    deletePost,
    getPostsByTag,
};
