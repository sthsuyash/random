import crypto from "crypto";
import bcryptjs from "bcryptjs";

import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
	sendPasswordResetEmail,
	sendResetSuccessEmail,
	sendVerificationEmail,
	sendWelcomeEmail,
} from "../mail/nodemailer/emails.js";

import { User } from "../models/user.model.js";
import { config } from "../config/index.js";
import { createResponse } from "../utils/responseModel.js";

const CLIENT_URL = config.server.clientURL;

/**
 * Registers a new user in the system, hashes their password, and sends a verification email.
 * @param {Object} req - The Express request object containing the user's registration data.
 * @param {Object} res - The Express response object to send back the response.
 * @returns {void}
 */
export const signup = async (req, res) => {
	const { email, password, name } = req.body;

	try {
		if (!email || !password || !name) {
			throw new Error("All fields are required");
		}

		// check if email is valid
		// required format: email@domain
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			throw new Error("Invalid email");
		}

		const userAlreadyExists = await User.findOne({ email });

		if (userAlreadyExists) {
			return res.status(400).json(createResponse(
				false,
				400,
				"User already exists"
			));
		}

		const hashedPassword = await bcryptjs.hash(password, 10);
		const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

		const user = new User({
			email,
			password: hashedPassword,
			name,
			verificationToken,
			role: "USER",
			verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
		});

		await user.save();

		generateTokenAndSetCookie(res, user._id, user.role);

		await sendVerificationEmail(user.email, verificationToken);

		res.status(201).json(createResponse(
			true,
			201,
			"User created successfully",
			{ ...user._doc, password: undefined }
		));
	} catch (error) {
		res.status(400).json(createResponse(false, 400, error.message));
	}
};

/**
 * Verifies the user's email using a verification code sent during signup.
 * @param {Object} req - The Express request object containing the verification code.
 * @param {Object} res - The Express response object to send back the response.
 * @returns {void}
 */
export const verifyEmail = async (req, res) => {
	const { code } = req.body;
	try {
		const user = await User.findOne({
			verificationToken: code,
			verificationTokenExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json(createResponse(
				false,
				400,
				"Invalid or expired verification code"
			));
		}

		user.isVerified = true;
		user.verificationToken = undefined;
		user.verificationTokenExpiresAt = undefined;
		await user.save();

		await sendWelcomeEmail(user.email, user.name);

		res.status(200).json(createResponse(
			true,
			200,
			"Email verified successfully",
			{ ...user._doc, password: undefined }
		));
	} catch (error) {
		console.log("error in verifyEmail ", error);
		res.status(500).json(createResponse(false, 500, "Server error"));
	}
};

/**
 * Logs a user into the system by validating their email and password.
 * @param {Object} req - The Express request object containing the user's login credentials (email and password).
 * @param {Object} res - The Express response object to send back the response.
 * @returns {void}
 */
export const login = async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json(createResponse(
				false,
				400,
				"Invalid credentials"
			));
		}
		const isPasswordValid = await bcryptjs.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(400).json(createResponse(
				false,
				400,
				"Invalid credentials"
			));
		}

		generateTokenAndSetCookie(res, user._id, user.role);

		user.lastLogin = new Date();
		await user.save();

		res.status(200).json(createResponse(
			true,
			200,
			"Logged in successfully",
			{ ...user._doc, password: undefined }
		));
	} catch (error) {
		console.log("Error in login ", error);
		res.status(400).json(createResponse(false, 400, error.message));
	}
};

/**
 * Logs the user out by clearing the authentication token from cookies.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object to send back the response.
 * @returns {void}
 */
export const logout = async (req, res) => {
	res.clearCookie("token");
	res.status(200).json(createResponse(
		true,
		200,
		"Logged out successfully"
	));
};

/**
 * Sends a password reset link to the user's email address if the user exists.
 * @param {Object} req - The Express request object containing the email for password reset.
 * @param {Object} res - The Express response object to send back the response.
 * @returns {void}
 */
export const forgotPassword = async (req, res) => {
	const { email } = req.body;
	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json(createResponse(
				false,
				400,
				"User not found"
			));
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(20).toString("hex");
		const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

		user.resetPasswordToken = resetToken;
		user.resetPasswordExpiresAt = resetTokenExpiresAt;

		await user.save();

		// send email
		await sendPasswordResetEmail(user.email, `${CLIENT_URL}/reset-password/${resetToken}`);

		res.status(200).json(createResponse(
			true,
			200,
			"Password reset link sent to your email"
		));
	} catch (error) {
		console.log("Error in forgotPassword ", error);
		res.status(400).json(createResponse(
			false,
			400,
			error.message
		));
	}
};

/**
 * Resets the user's password using a valid reset token and a new password.
 * @param {Object} req - The Express request object containing the reset token from the URL and new password.
 * @param {Object} res - The Express response object to send back the response.
 * @returns {void}
 */
export const resetPassword = async (req, res) => {
	try {
		const { token } = req.params;
		const { password } = req.body;

		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json(createResponse(
				false,
				400,
				"Invalid or expired reset token"
			));
		}

		// update password
		const hashedPassword = await bcryptjs.hash(password, 10);

		user.password = hashedPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiresAt = undefined;
		await user.save();

		await sendResetSuccessEmail(user.email);

		res.status(200).json(createResponse(
			true,
			200,
			"Password reset successful"
		));
	} catch (error) {
		console.log("Error in resetPassword ", error);
		res.status(400).json(createResponse(
			false,
			400,
			error.message
		));
	}
};
