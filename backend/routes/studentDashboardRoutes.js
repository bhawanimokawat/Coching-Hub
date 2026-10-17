const express = require("express");

const {
  getStudentDashboard,
} = require("../controllers/studentDashboardController");

const { protect } = require("../middleware/authmiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { requireInstitute } = require("../middleware/instituteMiddleware");

const router = express.Router();

router.get(
  "/",
  protect,
  authorizeRoles("student"),
  requireInstitute,
  getStudentDashboard
);

module.exports = router;