const Institute = require("../models/Institute");
const User = require("../models/user");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/apiResponse");

const getSuperAdminDashboard = asyncHandler(async (req, res) => {
  const [
    totalInstitutes,
    activeInstitutes,
    totalAdmins,
    totalStudents,
    totalTeachers,
  ] = await Promise.all([
    Institute.countDocuments(),

    Institute.countDocuments({
      isActive: true,
    }),

    User.countDocuments({
      role: "admin",
      isActive: true,
    }),

    User.countDocuments({
      role: "student",
      isActive: true,
    }),

    User.countDocuments({
      role: "teacher",
      isActive: true,
    }),
  ]);

  return sendResponse(
    res,
    200,
    "Super Admin dashboard fetched successfully.",
    {
      institutes: {
        total: totalInstitutes,
        active: activeInstitutes,
        inactive: totalInstitutes - activeInstitutes,
      },
      users: {
        admins: totalAdmins,
        students: totalStudents,
        teachers: totalTeachers,
      },
    }
  );
});

module.exports = { getSuperAdminDashboard };