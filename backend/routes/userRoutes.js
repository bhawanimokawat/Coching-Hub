const express = require("express");
const { getMyProfile ,getAllUsers,createInstituteUser,createInstituteAdmin,assignStudentToInstitute ,getInstituteStudents,updateStudentStatus,getInstituteTeachers} = require("../controllers/userControllers");
const { protect } = require("../middleware/authmiddleware");
const { requireInstitute } = require("../middleware/instituteMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");


const router = express.Router();

router.get("/me", protect, requireInstitute, getMyProfile);
router.get("/", protect, authorizeRoles("superAdmin"), getAllUsers);
router.post( "/", protect, authorizeRoles("admin"), requireInstitute, createInstituteUser);
router.post( "/create-admin", protect, authorizeRoles("superAdmin"), createInstituteAdmin);
router.patch("/:studentId/assign-institute",protect,authorizeRoles("admin"),requireInstitute,assignStudentToInstitute);
router.get( "/students",  protect,  authorizeRoles("admin"),  requireInstitute,  getInstituteStudents);
router.patch( "/students/:studentId/status", protect, authorizeRoles("admin"), requireInstitute, updateStudentStatus);
router.get("/teachers",protect,authorizeRoles("admin"),requireInstitute,getInstituteTeachers);

module.exports = router;