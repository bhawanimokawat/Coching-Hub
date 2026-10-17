const mongoose = require("mongoose");
const Institute = require("../models/Institute");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/apiResponse");
const User = require("../models/user");
const { hashPassword } = require("../utils/passwordUtils");

const getMyProfile = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, "Profile fetched successfully.", {
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      institute: req.user.institute,
    },
  });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select("name email role institute isActive createdAt")
    .populate("institute", "name code")
    .sort({ createdAt: -1 })
    .limit(100);

  return sendResponse(res, 200, "Users fetched successfully.", {
    users,
  });
});





const createInstituteUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    res.status(400);
    throw new Error("Name, email, and password are required.");
  }

  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedName || normalizedName.length > 100) {
    res.status(400);
    throw new Error("Name must be between 1 and 100 characters.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    res.status(400);
    throw new Error("Please provide a valid email address.");
  }

  if (password.length < 8 || password.length > 72) {
    res.status(400);
    throw new Error("Password must be between 8 and 72 characters.");
  }

  if (!["teacher", "student"].includes(role)) {
    res.status(400);
    throw new Error("Only teacher or student accounts can be created.");
  }

  if (!req.user.institute) {
    res.status(403);
    throw new Error("Your account is not assigned to an institute.");
  }

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    res.status(409);
    throw new Error("An account with this email already exists.");
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    name: normalizedName,
    email: normalizedEmail,
    password: hashedPassword,
    role,
    institute: req.user.institute,
  });

  return sendResponse(res, 201, "User created successfully.", {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      institute: user.institute,
      isActive: user.isActive,
    },
  });
});


const createInstituteAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, instituteId } = req.body;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof instituteId !== "string"
  ) {
    res.status(400);
    throw new Error("Name, email, password, and instituteId are required.");
  }

  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedName || normalizedName.length > 100) {
    res.status(400);
    throw new Error("Name must be between 1 and 100 characters.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    res.status(400);
    throw new Error("Please provide a valid email address.");
  }

  if (password.length < 12 || password.length > 72) {
    res.status(400);
    throw new Error("Password must be between 12 and 72 characters.");
  }

  if (!mongoose.isValidObjectId(instituteId)) {
    res.status(400);
    throw new Error("Invalid institute ID.");
  }

  const institute = await Institute.findOne({
    _id: instituteId,
    isActive: true,
  });

  if (!institute) {
    res.status(404);
    throw new Error("Active institute not found.");
  }

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    res.status(409);
    throw new Error("An account with this email already exists.");
  }

  const hashedPassword = await hashPassword(password);

  const admin = await User.create({
    name: normalizedName,
    email: normalizedEmail,
    password: hashedPassword,
    role: "admin",
    institute: institute._id,
  });

  return sendResponse(res, 201, "Institute Admin created successfully.", {
    user: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      institute: admin.institute,
      isActive: admin.isActive,
    },
  });
});


const assignStudentToInstitute = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  if (!mongoose.isValidObjectId(studentId)) {
    res.status(400);
    throw new Error("Invalid student ID.");
  }

  if (!req.user.institute) {
    res.status(403);
    throw new Error("Your admin account has no institute assigned.");
  }

  const student = await User.findOneAndUpdate(
    {
      _id: studentId,
      role: "student",
      institute: null,
    },
    {
      $set: { institute: req.user.institute },
    },
    {
      returnDocument: "after",
      runValidators: true,
    }
  );

  if (!student) {
    res.status(404);
    throw new Error(
      "Student not found, already assigned, or not eligible for assignment."
    );
  }

  return sendResponse(res, 200, "Student assigned to institute successfully.", {
    id: student._id,
    name: student.name,
    institute: student.institute,
  });
});

const getInstituteStudents = asyncHandler(async (req, res) => {
  const students = await User.find({
    institute: req.instituteId,
    role: "student",
  })
    .select("name email isActive createdAt")
    .sort({ createdAt: -1 })
    .limit(500);

  return sendResponse(
    res,
    200,
    "Institute students fetched successfully.",
    {
      count: students.length,
      students,
    }
  );
});

const updateStudentStatus = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { isActive } = req.body;

  if (!mongoose.isValidObjectId(studentId)) {
    res.status(400);
    throw new Error("Invalid student ID.");
  }

  if (typeof isActive !== "boolean") {
    res.status(400);
    throw new Error("isActive must be true or false.");
  }

  const student = await User.findOneAndUpdate(
    {
      _id: studentId,
      institute: req.instituteId,
      role: "student",
    },
    { $set: { isActive } },
    {
      returnDocument: "after",
      runValidators: true,
    }
  ).select("name email role institute isActive");

  if (!student) {
    res.status(404);
    throw new Error("Student not found in your institute.");
  }

  return sendResponse(
    res,
    200,
    "Student status updated successfully.",
    { student }
  );
});


const getInstituteTeachers = asyncHandler(async (req, res) => {
  const teachers = await User.find({
    institute: req.instituteId,
    role: "teacher",
  })
    .select("name email isActive createdAt")
    .sort({ createdAt: -1 })
    .limit(500);

  return sendResponse(
    res,
    200,
    "Institute teachers fetched successfully.",
    {
      count: teachers.length,
      teachers,
    }
  );
});



module.exports = { getMyProfile ,getAllUsers,createInstituteUser,createInstituteAdmin,assignStudentToInstitute,getInstituteStudents,updateStudentStatus,getInstituteTeachers};
