import express from "express";

import {
    isAdmin,
    isAdminOrUser,
} from "../middleware/verifyToken.js";
import { validatePassword } from "../middleware/validatePassword.js";

import {
    getUserDetails,
    updateUserDetails,
    changePassword,
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser,
    approveUserEmail,
    suspendUser,
    deleteSelf
} from "../controllers/user.controller.js";



const router = express.Router();

// User specific Routes
router.get("/me", getUserDetails); // Get details of the logged-in user
router.put("/me", updateUserDetails); // Update logged-in user's details
router.put("/me/password", validatePassword, changePassword); // Change password for logged-in user
router.delete("/me", deleteSelf); // Delete logged-in user

// Admin Routes (only accessible by admins)
router.get("/", isAdmin, getAllUsers); // Get all users (admin only)
router.put("/user/:userId/role", isAdmin, updateUserRole); // Update user role (admin only)
router.put("/user/:userId/approve", isAdmin, approveUserEmail); // Approve user email (admin only)
router.put("/user/:userId/suspend", isAdmin, suspendUser); // Suspend user (admin only)

// user and admin
router.get("/user/:userId", isAdminOrUser, getUserById); // Get a user by ID (admin or user)
router.put("/user/:userId", isAdminOrUser, updateUserDetails); // Update user details (admin or user)
router.delete("/user/:userId", isAdminOrUser, deleteUser); // Delete user (admin or user)

export default router;
