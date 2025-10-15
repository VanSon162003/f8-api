const postsService = require('@/service/posts.service');
const response = require('@/utils/response');

const getAllPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = 'published', search = '' } = req.query;
        
        const data = await postsService.getAllPosts(
            parseInt(page),
            parseInt(limit),
            status,
            search
        );
        
        response.success(res, 200, data);
    } catch (error) {
        response.error(res, 500, error.message);
    }
};

const getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const data = await postsService.getPostById(parseInt(id));
        
        response.success(res, 200, data);
    } catch (error) {
        if (error.message === 'Post not found') {
            response.error(res, 404, error.message);
        } else {
            response.error(res, 500, error.message);
        }
    }
};

const getPostBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        
        const data = await postsService.getPostBySlug(slug);
        
        response.success(res, 200, data);
    } catch (error) {
        if (error.message === 'Post not found') {
            response.error(res, 404, error.message);
        } else {
            response.error(res, 500, error.message);
        }
    }
};

const createPost = async (req, res) => {
    try {
        const postData = req.body;
        const authorId = req.user.id;
        
        const data = await postsService.createPost(postData, authorId);
        
        response.success(res, 201, data);
    } catch (error) {
        response.error(res, 500, error.message);
    }
};

const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const postData = req.body;
        const authorId = req.user.id;
        
        const data = await postsService.updatePost(parseInt(id), postData, authorId);
        
        response.success(res, 200, data);
    } catch (error) {
        if (error.message === 'Post not found') {
            response.error(res, 404, error.message);
        } else if (error.message === 'Unauthorized to update this post') {
            response.error(res, 403, error.message);
        } else {
            response.error(res, 500, error.message);
        }
    }
};

const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const authorId = req.user.id;
        
        const data = await postsService.deletePost(parseInt(id), authorId);
        
        response.success(res, 200, data);
    } catch (error) {
        if (error.message === 'Post not found') {
            response.error(res, 404, error.message);
        } else if (error.message === 'Unauthorized to delete this post') {
            response.error(res, 403, error.message);
        } else {
            response.error(res, 500, error.message);
        }
    }
};

const getPostsByTag = async (req, res) => {
    try {
        const { tagName } = req.params;
        const { page = 1, limit = 10 } = req.query;
        
        const data = await postsService.getPostsByTag(
            tagName,
            parseInt(page),
            parseInt(limit)
        );
        
        response.success(res, 200, data);
    } catch (error) {
        if (error.message === 'Tag not found') {
            response.error(res, 404, error.message);
        } else {
            response.error(res, 500, error.message);
        }
    }
};

module.exports = {
    getAllPosts,
    getPostById,
    getPostBySlug,
    createPost,
    updatePost,
    deletePost,
    getPostsByTag
};