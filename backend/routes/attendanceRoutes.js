
const express = require("express");
const { markAttendance, getBatchAttendance,getMyAttendance} = require("../controllers/attendanceController");
const { protect } = require("../middleware/authmiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { requireInstitute } = require("../middleware/instituteMiddleware");

const router = express.Router();

router.use(protect, requireInstitute);

router.post( "/", authorizeRoles("admin", "teacher"), markAttendance);
router.get( "/batch/:batchId", authorizeRoles("admin", "teacher"), getBatchAttendance);
router.get( "/my-attendance", authorizeRoles("student"), getMyAttendance);

module.exports = router;
