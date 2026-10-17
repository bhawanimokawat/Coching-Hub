const Batch = require("../models/Batch");
const Attendance = require("../models/Attendance");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/apiResponse");

const getTeacherDashboard = asyncHandler(async (req, res) => {
  const instituteId = req.instituteId;
  const teacherId = req.user._id;

  const batches = await Batch.find({
    institute: instituteId,
    teacher: teacherId,
    isActive: true,
  })
    .select("name code students startDate endDate")
    .sort({ name: 1 });

  const batchIds = batches.map((batch) => batch._id);

  const totalStudents = new Set(
    batches.flatMap((batch) =>
      batch.students.map((studentId) => String(studentId))
    )
  ).size;

  const attendanceSummary = await Attendance.aggregate([
    {
      $match: {
        institute: instituteId,
        markedBy: teacherId,
        batch: { $in: batchIds },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

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

  return sendResponse(
    res,
    200,
    "Teacher dashboard fetched successfully.",
    {
      totalBatches: batches.length,
      totalStudents,
      attendance,
      batches,
    }
  );
});

module.exports = { getTeacherDashboard };