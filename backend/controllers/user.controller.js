import { User } from "../models/user.model.js";
import { createResponse } from "../utils/responseModel.js";
import {
    sendWelcomeEmail,
    sendResetSuccessEmail
} from "../mail/nodemailer/emails.js";
import bcryptjs from "bcryptjs";

// User Controller

/**
 * Retrieves the details of the currently authenticated user.
 * @param {Object} req - The Express request object containing the user's ID (from the auth token).
 * @param {Object} res - The Express response object to send back the response.
 * @returns {void}
 */
export const getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(400).json(createResponse(
                false,
                400,
                "User not found"
            ));
        }
        res.status(200).json(createResponse(
            true,
            200,
            "User details fetched successfully",
            user
        ));
    } catch (error) {
        console.log("Error in getUserDetails ", error);
        res.status(500).json(createResponse(
            false,
            500,
            error.message
        ));
    }
};

/**
 * Updates the details of the currently authenticated user.
 * @param {Object} req - The Express request object containing the updated user data (name, email, password).
 * @param {Object} res - The Express response object to send back the response.
 * @returns {void}
 */
export const updateUserDetails = async (req, res) => {
    const { name, phone } = req.body;

    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(400).json(createResponse(
                false,
                400,
                "User not found"
            ));
        }

        // TODO: check if the phone number is already present in the database

        // Update user details
        if (name) user.name = name;

        await user.save();

        res.status(200).json(createResponse(true, 200, "User details updated", user));
    } catch (error) {
        console.log("Error in updateUserDetails ", error);
        res.status(500).json(createResponse(false, 500, error.message));
    }
};

/**
 * Changes the password for the currently authenticated user.
 * @param {Object} req - The Express request object containing the old and new passwords.
 * @param {Object} res - The Express response object to send back the response.
 * @returns {void}
 */
export const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(400).json(createResponse(
                false,
                400,
                "User not found"
            ));
        }

        const isOldPasswordValid = await bcryptjs.compare(oldPassword, user.password);

        if (!isOldPasswordValid) {
            return res.status(400).json(createResponse(
                false,
                400,
                "Old password is incorrect"
            ));
        }

        // Hash new password and save it
        user.password = await bcryptjs.hash(newPassword, 10);
        await user.save();

        await sendResetSuccessEmail(user.email);

        res.status(200).json(createResponse(
            true,
            200,
            "Password updated successfully"
        ));
    } catch (error) {
        console.log("Error in changePassword ", error);
        res.status(500).json(createResponse(
            false,
            500,
            error.message
        ));
    }
};

/**
 * Deletes the currently authenticated user.
 * 
 * @param {Object} req - The Express request object containing the user ID (from the auth token).
 * @param {Object} res - The Express response object to send back the response.
 * @returns {void}
 */
export const deleteSelf = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(400).json(createResponse(false, 400, "User not found"));
        }

        await user.deleteOne();
        // log out user
        res.clearCookie("token");

        res.status(200).json(createResponse(
            true,
            200,
            "User deleted successfully"
        ));
    } catch (error) {
        console.log("Error in deleteSelf ", error);
        res.status(500).json(createResponse(
            false,
            500,
            error.message
        ));
    }
};

// Admin Controller

/**
 * Retrieves all users (admin only) without passwords.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object to send back the response.
 * @returns {void}
 */
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json(createResponse(true, 200, "Users fetched successfully", users));
    } catch (error) {
        console.log("Error in getAllUsers ", error);
        res.status(500).json(createResponse(false, 500, error.message));
    }
};

/**
 * Retrieves a user by their ID (admin only).
 * @param {Object} req - The Express request object containing the user ID in params.
 * @param {Object} res - The Express response object to send back the response.
 * @returns {void}
 */
export const getUserById = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(400).json(createResponse(false, 400, "User not found"));
        }
        res.status(200).json(createResponse(true, 200, "User fetched successfully", user));
    } catch (error) {
        console.log("Error in getUserById ", error);
        res.status(500).json(createResponse(false, 500, error.message));
    }
};

/**
 * Updates the role of a user (admin only).
 * @param {Object} req - The Express request object containing the user ID in params and the role in the body.
 * @param {Object} res - The Express response object to send back the response.
 * @returns {void}
 */
export const updateUserRole = async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json(createResponse(false, 400, "User not found"));
        }

        // Check if role is valid
        if (!["USER", "ADMIN"].includes(role)) {
            return res.status(400).json(createResponse(false, 400, "Invalid role"));
        }

        user.role = role;
        await user.save();

        res.status(200).json(createResponse(true, 200, "User role updated", user));
    } catch (error) {
        console.log("Error in updateUserRole ", error);
        res.status(500).json(createResponse(false, 500, error.message));
    }
};

/**
 * Deletes a user by their ID (admin only).
 * @param {Object} req - The Express request object containing the user ID in params.
 * @param {Object} res - The Express response object to send back the response.
 * @returns {void}
 */
export const deleteUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json(createResponse(false, 400, "User not found"));
        }

        await user.remove();

        res.status(200).json(createResponse(true, 200, "User deleted successfully"));
    } catch (error) {
        console.log("Error in deleteUser ", error);
        res.status(500).json(createResponse(false, 500, error.message));
    }
};

/**
 * Admin can approve a user's email by setting their account to verified.
 * @param {Object} req - The Express request object containing the user ID in params.
 * @param {Object} res - The Express response object to send back the response.
 * @returns {void}
 */
export const approveUserEmail = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json(createResponse(false, 400, "User not found"));
        }

        if (user.isVerified) {
            return res.status(400).json(createResponse(false, 400, "User is already verified"));
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;

        await user.save();

        await sendWelcomeEmail(user.email, user.name);

        res.status(200).json(createResponse(true, 200, "User's email has been verified"));
    } catch (error) {
        console.log("Error in approveUserEmail ", error);
        res.status(500).json(createResponse(false, 500, error.message));
    }
};

/**
 * Suspends a user by their ID (admin only).
 * @param {Object} req - The Express request object containing the user ID in params.
 * @param {Object} res - The Express response object to send back the response.
 * @returns {void}
 */
export const suspendUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json(createResponse(false, 400, "User not found"));
        }

        user.isSuspended = true; // add isSuspended field to schema if not already present
        await user.save();

        res.status(200).json(createResponse(true, 200, "User suspended successfully"));
    } catch (error) {
        console.log("Error in suspendUser ", error);
        res.status(500).json(createResponse(false, 500, error.message));
    }
};
