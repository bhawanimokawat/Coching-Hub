
const mongoose = require("mongoose");

const requireInstitute = (req, res, next) => {
  if (!req.user) {
    res.status(401);
    return next(new Error("Authentication required."));
  }

  if (req.user.role === "superAdmin") {
    return next();
  }

  if (!req.user.institute) {
    res.status(403);
    return next(new Error("Your account is not assigned to an institute."));
  }

  if (!mongoose.isValidObjectId(req.user.institute)) {
    res.status(403);
    return next(new Error("Your institute assignment is invalid."));
  }

  req.instituteId = req.user.institute;
  next();
};

module.exports = { requireInstitute };
