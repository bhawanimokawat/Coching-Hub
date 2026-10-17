const express = require("express");
const { getInstituteDashboard,} = require("../controllers/dashboardControllers");

const { protect } = require("../middleware/authmiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { requireInstitute } = require("../middleware/instituteMiddleware");

const router = express.Router();

router.get("/",protect,authorizeRoles("admin"),requireInstitute,getInstituteDashboard);

module.exports = router;