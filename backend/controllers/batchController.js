
const mongoose = require("mongoose");
const Batch = require("../models/Batch");
const User = require("../models/user");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/apiResponse");

const createBatch = asyncHandler(async (req, res) => {
  const { name, code, teacher, startDate, endDate } = req.body;

  if (
    typeof name !== "string" ||
    typeof code !== "string" ||
    !name.trim() ||
    !code.trim()
  ) {
    res.status(400);
    throw new Error("Batch name and code are required.");
  }

  if (name.trim().length > 100) {
    res.status(400);
    throw new Error("Batch name cannot exceed 100 characters.");
  }

  if (!req.instituteId) {
    res.status(403);
    throw new Error("Institute context is required.");
  }

  let teacherId = null;

  if (teacher !== undefined && teacher !== null && teacher !== "") {
    if (!mongoose.isValidObjectId(teacher)) {
      res.status(400);
      throw new Error("Invalid teacher ID.");
    }

    const teacherUser = await User.findOne({
      _id: teacher,
      institute: req.instituteId,
      role: "teacher",
      isActive: true,
    });

    if (!teacherUser) {
      res.status(400);
      throw new Error("Active teacher not found in this institute.");
    }

    teacherId = teacherUser._id;
  }

  let parsedStartDate = null;
  let parsedEndDate = null;

  if (startDate !== undefined && startDate !== null && startDate !== "") {
    parsedStartDate = new Date(startDate);

    if (Number.isNaN(parsedStartDate.getTime())) {
      res.status(400);
      throw new Error("Invalid start date.");
    }
  }

  if (endDate !== undefined && endDate !== null && endDate !== "") {
    parsedEndDate = new Date(endDate);

    if (Number.isNaN(parsedEndDate.getTime())) {
      res.status(400);
      throw new Error("Invalid end date.");
    }
  }

  if (
    parsedStartDate &&
    parsedEndDate &&
    parsedEndDate < parsedStartDate
  ) {
    res.status(400);
    throw new Error("End date cannot be before start date.");
  }

  try {
    const batch = await Batch.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      institute: req.instituteId,
      teacher: teacherId,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
    });

    return sendResponse(res, 201, "Batch created successfully.", {
      batch,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409);
      throw new Error("This batch code already exists in your institute.");
    }

    throw error;
  }
});

const getBatches = asyncHandler(async (req, res) => {
  if (!req.instituteId) {
    res.status(403);
    throw new Error("Institute context is required.");
  }

  const batches = await Batch.find({
    institute: req.instituteId,
  })
    .populate("teacher", "name email")
    .sort({ createdAt: -1 })
    .limit(100);

  return sendResponse(res, 200, "Batches fetched successfully.", {
    batches,
  });
});




const enrollStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.body;
  const { batchId } = req.params;

  if (
    !mongoose.isValidObjectId(batchId) ||
    !mongoose.isValidObjectId(studentId)
  ) {
    res.status(400);
    throw new Error("Valid batchId and studentId are required.");
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

  if (batch.students.some((id) => String(id) === String(student._id))) {
    res.status(409);
    throw new Error("Student is already enrolled in this batch.");
  }

  batch.students.push(student._id);
  await batch.save();

  return sendResponse(res, 200, "Student enrolled successfully.", {
    batchId: batch._id,
    studentId: student._id,
    totalStudents: batch.students.length,
  });
});


const getMyBatches = asyncHandler(async (req, res) => {
  const batches = await Batch.find({
    institute: req.instituteId,
    students: req.user._id,
    isActive: true,
  })
    .populate("teacher", "name email")
    .select("name code teacher startDate endDate")
    .sort({ name: 1 });

  return sendResponse(
    res,
    200,
    "Your batches fetched successfully.",
    {
      count: batches.length,
      batches,
    }
  );
});

const updateBatch = asyncHandler(async (req, res) => {
  const { batchId } = req.params;
  const { name, code, teacher, startDate, endDate, isActive } = req.body;

  if (!mongoose.isValidObjectId(batchId)) {
    res.status(400);
    throw new Error("Invalid batch ID.");
  }

  const batch = await Batch.findOne({
    _id: batchId,
    institute: req.instituteId,
  });

  if (!batch) {
    res.status(404);
    throw new Error("Batch not found in your institute.");
  }

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim() || name.trim().length > 100) {
      res.status(400);
      throw new Error("Batch name is required and must not exceed 100 characters.");
    }
    batch.name = name.trim();
  }

  if (code !== undefined) {
    if (typeof code !== "string" || !code.trim()) {
      res.status(400);
      throw new Error("Valid batch code is required.");
    }
    batch.code = code.trim().toUpperCase();
  }

  if (teacher !== undefined) {
    if (teacher === null || teacher === "") {
      batch.teacher = null;
    } else {
      if (!mongoose.isValidObjectId(teacher)) {
        res.status(400);
        throw new Error("Invalid teacher ID.");
      }

      const teacherUser = await User.findOne({
        _id: teacher,
        institute: req.instituteId,
        role: "teacher",
        isActive: true,
      });

      if (!teacherUser) {
        res.status(400);
        throw new Error("Active teacher not found in your institute.");
      }

      batch.teacher = teacherUser._id;
    }
  }

  if (startDate !== undefined) {
    const date = new Date(startDate);
    if (!startDate || !Number.isFinite(date.getTime())) {
      res.status(400);
      throw new Error("Invalid start date.");
    }
    batch.startDate = date;
  }

  if (endDate !== undefined) {
    const date = new Date(endDate);
    if (!endDate || !Number.isFinite(date.getTime())) {
      res.status(400);
      throw new Error("Invalid end date.");
    }
    batch.endDate = date;
  }

  if (
    batch.startDate &&
    batch.endDate &&
    batch.endDate < batch.startDate
  ) {
    res.status(400);
    throw new Error("End date cannot be before start date.");
  }

  if (isActive !== undefined) {
    if (typeof isActive !== "boolean") {
      res.status(400);
      throw new Error("isActive must be true or false.");
    }
    batch.isActive = isActive;
  }

  await batch.save();

  return sendResponse(res, 200, "Batch updated successfully.", {
    batch,
  });
});

module.exports = { createBatch, getBatches ,enrollStudent,getMyBatches,updateBatch};
