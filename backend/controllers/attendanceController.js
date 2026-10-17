
const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const Batch = require("../models/Batch");
const User = require("../models/user");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/apiResponse");



const markAttendance = asyncHandler(async (req, res) => {
  const { batchId, studentId, date, status } = req.body;

  if (
    !mongoose.isValidObjectId(batchId) ||
    !mongoose.isValidObjectId(studentId)
  ) {
    res.status(400);
    throw new Error("Valid batchId and studentId are required.");
  }

  if (!["present", "absent", "late"].includes(status)) {
    res.status(400);
    throw new Error("Status must be present, absent, or late.");
  }

  if (
    typeof date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    res.status(400);
    throw new Error("Date must use YYYY-MM-DD format.");
  }

  const attendanceDate = new Date(`${date}T00:00:00.000Z`);

  if (
    Number.isNaN(attendanceDate.getTime()) ||
    attendanceDate.toISOString().slice(0, 10) !== date
  ) {
    res.status(400);
    throw new Error("Invalid attendance date.");
  }

  const batch = await Batch.findOne({
    _id: batchId,
    institute: req.instituteId,
    isActive: true,
  });

  if (!batch) {
    res.status(404);
    throw new Error("Batch not found in your institute.");
  }

  if (
    req.user.role === "teacher" &&
    String(batch.teacher) !== String(req.user._id)
  ) {
    res.status(403);
    throw new Error("You are not assigned to this batch.");
  }

  const student = await User.findOne({
    _id: studentId,
    institute: req.instituteId,
    role: "student",
    isActive: true,
  });

  if (!student) {
    res.status(404);
    throw new Error("Active student not found in your institute.");
  }

  if (!batch.students.some((id) => String(id) === String(student._id))) {
    res.status(400);
    throw new Error("Student is not enrolled in this batch.");
  }

  const existing = await Attendance.findOne({
    institute: req.instituteId,
    batch: batch._id,
    student: student._id,
    date: attendanceDate,
  });

  if (existing) {
    res.status(409);
    throw new Error("Attendance has already been marked for this student and date.");
  }

  const attendance = await Attendance.create({
    institute: req.instituteId,
    batch: batch._id,
    student: student._id,
    date: attendanceDate,
    status,
    markedBy: req.user._id,
  });

  return sendResponse(res, 201, "Attendance marked successfully.", {
    attendance,
  });
});

const getBatchAttendance = asyncHandler(async (req, res) => {
  const { batchId } = req.params;

  if (!mongoose.isValidObjectId(batchId)) {
    res.status(400);
    throw new Error("Invalid batch ID.");
  }

  const batch = await Batch.findOne({
    _id: batchId,
    institute: req.instituteId,
    isActive: true,
  });

  if (!batch) {
    res.status(404);
    throw new Error("Batch not found in your institute.");
  }

  if (
    req.user.role === "teacher" &&
    String(batch.teacher) !== String(req.user._id)
  ) {
    res.status(403);
    throw new Error("You are not assigned to this batch.");
  }

  const attendance = await Attendance.find({
    institute: req.instituteId,
    batch: batch._id,
  })
    .populate("student", "name email")
    .populate("markedBy", "name")
    .sort({ date: -1 })
    .limit(500);

  return sendResponse(res, 200, "Attendance fetched successfully.", {
    attendance,
  });
});


const getMyAttendance = asyncHandler(async (req, res) => {
  const records = await Attendance.find({
    institute: req.instituteId,
    student: req.user._id,
  })
    .populate("batch", "name code")
    .populate("markedBy", "name")
    .sort({ date: -1 })
    .limit(500);

  const summary = {
    total: records.length,
    present: 0,
    absent: 0,
    late: 0,
  };

  records.forEach((record) => {
    summary[record.status] += 1;
  });

  const attendancePercentage =
    summary.total === 0
      ? 0
      : Number(
          (((summary.present + summary.late) / summary.total) * 100).toFixed(2)
        );

  return sendResponse(
    res,
    200,
    "Your attendance fetched successfully.",
    {
      summary: {
        ...summary,
        attendancePercentage,
      },
      records,
    }
  );
});

module.exports = { markAttendance, getBatchAttendance,getMyAttendance };
