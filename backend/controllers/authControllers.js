
const User = require("../models/user");
const asyncHandler = require("../utils/asyncHandler");
const { hashPassword } = require("../utils/passwordUtils");
const { generateToken } = require("../utils/jwtUtils");
const sendResponse = require("../utils/apiResponse");
const { comparePassword } = require("../utils/passwordUtils");



const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, institute } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required.");
  }

  if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
    res.status(400);
    throw new Error("Name, email, and password must be strings.");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    res.status(409);
    throw new Error("An account with this email already exists.");
  }

  // Public registration cannot create privileged accounts.
  if (role && role !== "student") {
    res.status(403);
    throw new Error("Privileged roles can only be assigned by an authorized administrator.");
  }

  if (institute) {
    res.status(400);
    throw new Error("Institute assignment is not available through public registration yet.");
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: "student",
    institute: null,
  });

  const token = generateToken(user._id);

  return sendResponse(res, 201, "Registration successful.", {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  });
});



const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    res.status(400);
    throw new Error("Valid email and password are required.");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user || !(await comparePassword(password, user.password))) {
    res.status(401);
    throw new Error("Invalid email or password.");
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error("Your account is inactive.");
  }

  const token = generateToken(user._id);

  return sendResponse(res, 200, "Login successful.", {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      institute: user.institute,
    },
    token,
  });
});



const logoutUser = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, "Logged out successfully.", null);
});


module.exports = { registerUser,loginUser,logoutUser };
