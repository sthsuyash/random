import { Post } from '../models/post.model.js'
import { createResponse } from "../utils/responseModel.js";
import { paginate } from "../utils/pagination.js";
import { config } from "../config/index.js";

const POSTS_URL = config.server.apiURL + "/posts";

/**
 * Fetches all posts with pagination.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object to send back the response.
 * @returns {void}
 */
export const getAllPosts = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
        const skip = (page - 1) * limit;
        const totalPosts = await Post.countDocuments();

        const posts = await Post.find().skip(skip).limit(limit);
        const currentTotal = posts.length;

        // Handle pagination and validation in one step
        const pagination = paginate(totalPosts, currentTotal, page, limit, POSTS_URL);

        // If pagination returns an error (invalid page), return the error response
        if (pagination.error) {
            return res.status(pagination.status).json(createResponse(
                false,
                pagination.status,
                pagination.message,
                { totalPages: pagination.totalPages }
            ));
        }

        const response = {
            ...pagination,
            posts,
        };

        return res.status(200).json(createResponse(
            true,
            200,
            "All posts fetched successfully",
            response
        ));
    } catch (error) {
        console.error(error.message);
        return res.status(500).json(createResponse(false, 500, "Internal server error"));
    }
};


/**
 * Fetches the most recent active news posts.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object to send back the response.
 * @returns {void}
 */
export const getRecentPosts = async (req, res) => {
    const { page = 1, limit = 6 } = req.query; // Default limit is 6 if not provided
    try {
        // Calculate skip value based on the page and limit
        const skip = (page - 1) * limit;

        // Count the total number of published posts
        const totalNews = await Post.countDocuments({ status: 'PUBLISHED' });

        // Fetch the paginated news items
        const news = await Post.find({ status: 'PUBLISHED' })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const currentTotal = news.length;

        // Handle pagination and validation in one step
        const pagination = paginate(totalNews, currentTotal, page, limit, POSTS_URL + "/recent");

        // If pagination returns an error (invalid page), return the error response
        if (pagination.error) {
            return res.status(pagination.status).json(createResponse(
                false,
                pagination.status,
                pagination.message,
                { totalPages: pagination.totalPages }
            ));
        }

        const response = {
            ...pagination,
            news,
        };

        return res.status(200).json(createResponse(
            true,
            200,
            "Recent news fetched successfully",
            response
        ));
    } catch (error) {
        console.error(error.message);
        return res.status(500).json(createResponse(false, 500, "Internal server error"));
    }
};


/**
 * Searches news posts based on a search value with pagination.
 * @param {Object} req - The Express request object containing search value in query.
 * @param {Object} res - The Express response object to send back the response.
 * @returns {void}
 */
export const searchNews = async (req, res) => {
    const { q, page = 1, limit = 10 } = req.query; // Default page = 1, limit = 10
    try {
        // Check if search value is provided
        if (!q) {
            return res.status(400).json(createResponse(
                false,
                400,
                "Search value is required"
            ));
        }

        // Calculate skip value based on page and limit
        const skip = (page - 1) * limit;

        // Count the total number of published posts that match the search query
        const totalNews = await Post.countDocuments({
            status: 'PUBLISHED',
            $text: { $search: q }
        });

        // Fetch the paginated search results
        const news = await Post.find({
            status: 'PUBLISHED',
            $text: { $search: q }
        })
            .skip(skip)
            .limit(limit);

        const currentTotal = news.length;

        // Handle pagination and validation in one step
        const pagination = paginate(totalNews, currentTotal, page, limit, POSTS_URL + "/search?q=" + q);

        // If pagination returns an error (invalid page), return the error response
        if (pagination.error) {
            return res.status(pagination.status).json(createResponse(
                false,
                pagination.status,
                pagination.message,
                { totalPages: pagination.totalPages }
            ));
        }

        const response = {
            ...pagination,
            news,
        };

        return res.status(200).json(createResponse(
            true,
            200,
            "News search results",
            response
        ));
    } catch (error) {
        console.error(error.message);
        return res.status(500).json(createResponse(false, 500, "Internal server error"));
    }
};

/**
 * Fetches the list of categories with their news count.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object to send back the response.
 * @returns {void}
 */
export const getCategories = async (req, res) => {
    try {
        const categories = await Post.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $project: { _id: 0, category: "$_id", count: 1 } },
        ]);
        return res.status(200).json(createResponse(true, 200, "Categories fetched successfully", categories));
    } catch (error) {
        console.error(error.message);
        return res.status(500).json(createResponse(false, 500, "Internal server error"));
    }
};

/**
 * Fetches the top news posts by category based on visit count.
 * @param {Object} req - The Express request object containing category in params.
 * @param {Object} res - The Express response object to send back the response.
 * @returns {void}
 */
export const getTopPostsByCategory = async (req, res) => {
    const { category } = req.params;
    try {
        const { page = 1, limit = 5 } = req.query;
        const skip = (page - 1) * limit;
        const totalPosts = await Post.countDocuments({ category, status: 'PUBLISHED' });

        const topPosts = await Post.find({ category, status: 'PUBLISHED' })
            .sort({ visitCount: -1 })
            .skip(skip)
            .limit(limit);

        const currentTotal = topPosts.length;
        const pagination = paginate(totalPosts, currentTotal, page, limit, POSTS_URL + `/category/${category}/top`);

        if (pagination.error) {
            return res.status(pagination.status).json(createResponse(
            false,
            pagination.status,
            pagination.message,
            { totalPages: pagination.totalPages }
            ));
        }

        const response = {
            ...pagination,
            news: topPosts
        };

        return res.status(200).json(createResponse(
            true,
            200,
            `Top ${category} news fetched successfully`,
            response
        ));
    }
    catch (error) {
        console.error(error.message);
        return res.status(500).json(createResponse(
            false,
            500,
            "Internal server error"
        ));
    }
}

/**
 * 
*/
export const getRelatedPosts = async (req, res) => {
    const { postId } = req.params;
    
    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json(createResponse(
                false,
                404,
                "Post not found"
            ));
        }

        const relatedPosts = await Post.find({
            _id: { $ne: postId },
            category: post.category,
            status: 'PUBLISHED'
        }).limit(4).sort({ createdAt: -1 });

        return res.status(200).json(createResponse(
            true,
            200,
            "Related posts fetched successfully",
            relatedPosts
        ));
    }
    catch (error) {
        console.error(error.message);
        return res.status(500).json(createResponse(
            false,
            500,
            "Internal server error"
        ));
    }
}


export const getPostBySlug = async (req, res) => {
    const { slug } = req.params;
    try {
        const post = await Post.findOneAndUpdate(
            { slug },
            { $inc: { visitCount: 1 } },
            { new: true }
        );

        if (!post) {
            return res.status(404).json(createResponse(
                false,
                404,
                "Post not found"
            ));
        }

        return res.status(200).json(createResponse(
            true,
            200,
            "Post fetched successfully",
            post
        ));
    }
    catch (error) {
        console.error(error.message);
        return res.status(500).json(createResponse(
            false,
            500,
            "Internal server error"
        ));
    }
}


/**
 * Fetches dashboard news posts for authenticated users, depending on their role.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object to send back the response.
 * @returns {void}
 */
export const getDashboardNews = async (req, res) => {
    const { id, role } = req.userInfo;
    try {
        const query = role === 'admin' ? {} : { writerId: new ObjectId(id) };
        const news = await Post.find(query).sort({ createdAt: -1 });
        return res.status(200).json(createResponse(true, 200, "Dashboard news fetched successfully", news));
    } catch (error) {
        console.error(error.message);
        return res.status(500).json(createResponse(false, 500, "Internal server error"));
    }
};

/**
 * Fetches a single news post by its ID for the dashboard.
 * @param {Object} req - The Express request object containing news ID in params.
 * @param {Object} res - The Express response object to send back the response.
 * @returns {void}
 */
export const getDashboardSingleNews = async (req, res) => {
    const { news_id } = req.params;
    try {
        const news = await Post.findById(news_id);
        if (!news) {
            return res.status(404).json(createResponse(false, 404, "News not found"));
        }
        return res.status(200).json(createResponse(true, 200, "Single news fetched successfully", news));
    } catch (error) {
        console.error(error.message);
        return res.status(500).json(createResponse(false, 500, "Internal server error"));
    }
};

/**
 * Fetches the most popular active news posts.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object to send back the response.
 * @returns {void}
 */
export const getPopularNews = async (req, res) => {
    try {
        const popularNews = await Post.find({ status: 'PUBLISHED' }).sort({ visitCount: -1 }).limit(4);
        return res.status(200).json(createResponse(true, 200, "Popular news fetched successfully", popularNews));
    } catch (error) {
        console.error(error.message);
        return res.status(500).json(createResponse(false, 500, "Internal server error"));
    }
};

/**
 * Fetches the latest active news posts.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object to send back the response.
 * @returns {void}
 */
export const getLatestNews = async (req, res) => {
    try {
        const news = await Post.find({ status: 'PUBLISHED' }).sort({ createdAt: -1 }).limit(6);
        return res.status(200).json(createResponse(true, 200, "Latest news fetched successfully", news));
    } catch (error) {
        console.error(error.message);
        return res.status(500).json(createResponse(false, 500, "Internal server error"));
    }
};

/**
 * Fetches a single news post by its slug.
 * @param {Object} req - The Express request object containing the news slug in params.
 * @param {Object} res - The Express response object to send back the response.
 * @returns {void}
 */
export const getNews = async (req, res) => {
    const { slug } = req.params;
    try {
        const news = await Post.findOneAndUpdate({ slug }, { $inc: { visitCount: 1 } }, { new: true });
        const relatedNews = await Post.find({
            slug: { $ne: slug },
            category: news.category,
            status: 'PUBLISHED'
        }).limit(4).sort({ createdAt: -1 });

        return res.status(200).json(createResponse(true, 200, "News fetched successfully", { news, relatedNews }));
    } catch (error) {
        console.error(error.message);
        return res.status(500).json(createResponse(false, 500, "Internal server error"));
    }
};

/**
 * Fetches all news categorized by their category.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object to send back the response.
 * @returns {void}
 */
export const getAllNewsByCategory = async (req, res) => {
    try {
        const categoryNews = await Post.aggregate([
            { $match: { status: 'PUBLISHED' } },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$category",
                    news: { $push: { _id: '$_id', title: '$title', slug: '$slug', image: '$image', description: '$description', category: '$category' } }
                },
            },
            {
                $project: {
                    _id: 0,
                    category: '$_id',
                    news: { $slice: ['$news', 5] }
                },
            }
        ]);

        const news = categoryNews.reduce((acc, category) => {
            acc[category.category] = category.news;
            return acc;
        }, {});

        return res.status(200).json(createResponse(true, 200, "All news by category fetched successfully", news));
    } catch (error) {
        console.error(error.message);
        return res.status(500).json(createResponse(false, 500, "Internal server error"));
    }
};
