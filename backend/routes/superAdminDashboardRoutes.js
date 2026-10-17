const express = require("express");
const { getSuperAdminDashboard,} = require("../controllers/superAdminDashboardController");

const { protect } = require("../middleware/authmiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/",protect,authorizeRoles("superAdmin"),getSuperAdminDashboard);

module.exports = router;