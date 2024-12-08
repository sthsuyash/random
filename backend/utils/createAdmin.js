import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import { User } from "../models/user.model.js"; // Ensure this path is correct
import { config } from "../config/index.js"; // Ensure this path is correct

/**
 * Utility function to create an admin user.
 * This should be run as an npm script to ensure at least one admin exists.
 * @returns {Promise<void>} - Resolves when the admin user is created.
 */
const createAdmin = async () => {
    const ADMIN_EMAIL = config.admin.email;
    const ADMIN_PASSWORD = config.admin.password;
    const ADMIN_NAME = config.admin.name;

    try {
        // Check if an admin user already exists
        const existingAdmin = await User.findOne({ role: "ADMIN" });

        if (existingAdmin) {
            console.log("Admin user already exists.");
            return;
        }

        // Create a new admin user
        const hashedPassword = await bcryptjs.hash(ADMIN_PASSWORD, 10);

        const admin = new User({
            email: ADMIN_EMAIL,
            password: hashedPassword,
            name: ADMIN_NAME,
            role: "ADMIN",
            isVerified: true, // Set admin as verified directly
        });

        // Save the admin user to the database
        await admin.save();

        console.log(`Admin user created successfully: ${ADMIN_EMAIL}`);
    } catch (error) {
        console.error("Error creating admin:", error);
    }
};

// Main logic to connect to MongoDB and create the admin user
const initializeAdmin = async () => {
    const MONGO_URI = config.db.url;

    try {
        const conn = await mongoose.connect(MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Call the createAdmin function after MongoDB connection
        await createAdmin();

        // Disconnect from MongoDB after operation
        await mongoose.disconnect();

    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1);
    }
};

// Execute the admin creation logic
initializeAdmin();
