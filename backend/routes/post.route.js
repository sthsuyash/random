import express from "express";
import {
    getAllPosts,
    getRecentPosts,
    searchNews,
    getCategories,
    getTopPostsByCategory,
    getPopularNews,
    getPostBySlug,
    getRelatedPosts,
//     getPost,
//     createPost,
//     deletePost,
//     uploadAuth,
//     featurePost,
} from "../controllers/post.controller.js";

const router = express.Router();

router.get("/", getAllPosts);
router.get("/recent", getRecentPosts);
router.get("/search", searchNews);
router.get("/popular", getPopularNews);
router.get("/:slug", getPostBySlug);
router.get("/recommended/:postId", getRelatedPosts);

// category routes
router.get("/category/all", getCategories);
router.get("/category/:category", getTopPostsByCategory);

// router.post("/", createPost);
// router.delete("/:id", deletePost);
// router.patch("/feature", featurePost);

export default router;
