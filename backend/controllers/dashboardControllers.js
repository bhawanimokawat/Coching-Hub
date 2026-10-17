const User = require("../models/user");
const Batch = require("../models/Batch");
const Fee = require("../models/fee");
const Attendance = require("../models/Attendance");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/apiResponse");

const getInstituteDashboard = asyncHandler(async (req, res) => {
  const instituteId = req.instituteId;

  const [
    totalStudents,
    totalTeachers,
    totalBatches,
    feeSummary,
    attendanceSummary,
  ] = await Promise.all([
    User.countDocuments({
      institute: instituteId,
      role: "student",
      isActive: true,
    }),

    User.countDocuments({
      institute: instituteId,
      role: "teacher",
      isActive: true,
    }),

    Batch.countDocuments({
      institute: instituteId,
      isActive: true,
    }),

    Fee.aggregate([
      { $match: { institute: instituteId } },
      {
        $group: {
          _id: null,
          totalFees: { $sum: "$amount" },
          totalCollected: { $sum: "$paidAmount" },
          totalOutstanding: {
            $sum: { $subtract: ["$amount", "$paidAmount"] },
          },
          feeRecords: { $sum: 1 },
        },
      },
    ]),

    Attendance.aggregate([
      { $match: { institute: instituteId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const fees = feeSummary[0] || {
    totalFees: 0,
    totalCollected: 0,
    totalOutstanding: 0,
    feeRecords: 0,
  };

  const attendance = {
    present: 0,
    absent: 0,
    late: 0,
  };

  attendanceSummary.forEach((item) => {
    attendance[item._id] = item.count;
  });

  return sendResponse(res, 200, "Dashboard statistics fetched successfully.", {
    students: totalStudents,
    teachers: totalTeachers,
    batches: totalBatches,
    fees: {
      totalFees: Number(fees.totalFees.toFixed(2)),
      totalCollected: Number(fees.totalCollected.toFixed(2)),
      totalOutstanding: Number(fees.totalOutstanding.toFixed(2)),
      feeRecords: fees.feeRecords,
    },
    attendance,
  });
});

module.exports = { getInstituteDashboard };