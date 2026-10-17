const User = require("../models/user");
const Batch = require("../models/Batch");
const Fee = require("../models/fee");
const Attendance = require("../models/Attendance");

const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/apiResponse");

const getStudentDashboard = asyncHandler(async (req, res) => {
  const instituteId = req.instituteId;
  const studentId = req.user._id;

  const [student, totalBatches, feeSummary, attendanceSummary] =
    await Promise.all([
      User.findOne({
        _id: studentId,
        institute: instituteId,
        role: "student",
        isActive: true,
      }).select("name email role institute"),

      Batch.countDocuments({
        institute: instituteId,
        students: studentId,
        isActive: true,
      }),

      Fee.aggregate([
        {
          $match: {
            institute: instituteId,
            student: studentId,
          },
        },
        {
          $group: {
            _id: null,
            totalFees: { $sum: "$amount" },
            totalPaid: { $sum: "$paidAmount" },
            totalOutstanding: {
              $sum: { $subtract: ["$amount", "$paidAmount"] },
            },
          },
        },
      ]),

      Attendance.aggregate([
        {
          $match: {
            institute: instituteId,
            student: studentId,
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

  if (!student) {
    res.status(404);
    throw new Error("Student profile not found.");
  }

  const fees = feeSummary[0] || {
    totalFees: 0,
    totalPaid: 0,
    totalOutstanding: 0,
  };

  const attendance = {
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
  };

  attendanceSummary.forEach(({ _id, count }) => {
    attendance[_id] = count;
    attendance.total += count;
  });

  const attendancePercentage =
    attendance.total === 0
      ? 0
      : Number(
          (((attendance.present + attendance.late) /
            attendance.total) *
            100).toFixed(2)
        );

  return sendResponse(
    res,
    200,
    "Student dashboard fetched successfully.",
    {
      student,
      totalBatches,
      fees: {
        totalFees: Number(fees.totalFees.toFixed(2)),
        totalPaid: Number(fees.totalPaid.toFixed(2)),
        totalOutstanding: Number(
          Math.max(0, fees.totalOutstanding).toFixed(2)
        ),
      },
      attendance: {
        ...attendance,
        attendancePercentage,
      },
    }
  );
});

module.exports = { getStudentDashboard };