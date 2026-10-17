const express = require("express");

const {  getTeacherDashboard,} = require("../controllers/teacherDashboardController");

const { protect } = require("../middleware/authmiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { requireInstitute } = require("../middleware/instituteMiddleware");

const router = express.Router();

router.get( "/", protect, authorizeRoles("teacher"), requireInstitute, getTeacherDashboard);

module.exports = router;