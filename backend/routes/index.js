import express from "express";

// Import routes
import authRoutes from './auth.route.js';
import userRoutes from './user.route.js';
import postRoutes from './post.route.js';
import commentRoutes from './comment.route.js';

// Middleware
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', verifyToken, userRoutes);
router.use('/posts', postRoutes);
router.use('/comments', commentRoutes);

export default router;
