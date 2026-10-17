const User = require("../models/user");
const { verifyToken } = require("../utils/jwtUtils");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Authentication required. Please log in.");
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  const user = await User.findById(decoded.id);

  if (!user) {
    res.status(401);
    throw new Error("User account not found.");
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error("Your account is inactive.");
  }

  req.user = user;
  next();
});

module.exports = { protect };
