
const mongoose = require("mongoose");
const Institute = require("../models/Institute");

const requireInstitute = async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401);
      throw new Error("Authentication required.");
    }

    if (req.user.role === "superAdmin") {
      return next();
    }

    if (!req.user.institute) {
      res.status(403);
      throw new Error("Your account is not assigned to an institute.");
    }

    if (!mongoose.isValidObjectId(req.user.institute)) {
      res.status(403);
      throw new Error("Your institute assignment is invalid.");
    }

    const institute = await Institute.findById(req.user.institute)
      .select("_id isActive");

    if (!institute || !institute.isActive) {
      res.status(403);
      throw new Error("Your institute is inactive or unavailable.");
    }

    req.instituteId = institute._id;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { requireInstitute };
