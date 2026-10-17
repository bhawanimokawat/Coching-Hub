
require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/user");
const { hashPassword } = require("../utils/passwordUtils");

const seedSuperAdmin = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing.");
    }

    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error("Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD.");
    }

    if (ADMIN_PASSWORD.length < 12) {
      throw new Error("ADMIN_PASSWORD must contain at least 12 characters.");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const email = ADMIN_EMAIL.trim().toLowerCase();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.role !== "superAdmin") {
        throw new Error("Email already belongs to a non-superAdmin user.");
      }

      console.log("Super admin already exists. No changes made.");
      return;
    }

    const password = await hashPassword(ADMIN_PASSWORD);

    await User.create({
      name: ADMIN_NAME.trim(),
      email,
      password,
      role: "superAdmin",
      institute: null,
    });

    console.log("Super admin created successfully.");
  } catch (error) {
    console.error("Super admin seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
};

seedSuperAdmin();
