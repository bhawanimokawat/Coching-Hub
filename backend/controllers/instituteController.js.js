
const Institute = require("../models/Institute");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/apiResponse");

const createInstitute = asyncHandler(async (req, res) => {
  const { name, code, email, phone, address } = req.body;

  if (!name || !code || !email) {
    res.status(400);
    throw new Error("Name, code, and email are required.");
  }

  const normalizedCode = code.trim().toUpperCase();
  const normalizedEmail = email.trim().toLowerCase();

  const existingInstitute = await Institute.findOne({
    $or: [
      { code: normalizedCode },
      { email: normalizedEmail },
    ],
  });

  if (existingInstitute) {
    res.status(409);
    throw new Error("Institute code or email already exists.");
  }

  const institute = await Institute.create({
    name,
    code: normalizedCode,
    email: normalizedEmail,
    phone,
    address,
  });

  return sendResponse(res, 201, "Institute created successfully.", {
    institute,
  });
});

const getInstitutes = asyncHandler(async (req, res) => {
  const institutes = await Institute.find()
    .select("name code email phone address isActive createdAt")
    .sort({ createdAt: -1 });

  return sendResponse(res, 200, "Institutes fetched successfully.", {
    institutes,
  });
});


const updateInstitute = asyncHandler(async (req, res) => {
  const { name, email, phone, address, isActive } = req.body;

  const updates = {};

  if (name !== undefined) updates.name = name;
  if (email !== undefined) updates.email = email;
  if (phone !== undefined) updates.phone = phone;
  if (address !== undefined) updates.address = address;
  if (isActive !== undefined) updates.isActive = isActive;

  if (Object.keys(updates).length === 0) {
    res.status(400);
    throw new Error("At least one field is required to update.");
  }

  if (typeof name === "string" && !name.trim()) {
    res.status(400);
    throw new Error("Institute name cannot be empty.");
  }

  if (typeof email === "string") {
    updates.email = email.trim().toLowerCase();

    const existing = await Institute.findOne({
      email: updates.email,
      _id: { $ne: req.params.id },
    });

    if (existing) {
      res.status(409);
      throw new Error("Institute email already exists.");
    }
  }

  const institute = await Institute.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    {

      returnDocument: "after",
      runValidators: true,

    }
  );

  if (!institute) {
    res.status(404);
    throw new Error("Institute not found.");
  }

  return sendResponse(
    res,
    200,
    "Institute updated successfully.",
    { institute }
  );
});


const deactivateInstitute = asyncHandler(async (req, res) => {
  const institute = await Institute.findByIdAndUpdate(
    req.params.id,
    { $set: { isActive: false } },
    {
      returnDocument: "after",
      runValidators: true,
    }
  );

  if (!institute) {
    res.status(404);
    throw new Error("Institute not found.");
  }

  return sendResponse(
    res,
    200,
    "Institute deactivated successfully.",
    { institute }
  );
});


module.exports = {
  createInstitute,
  getInstitutes,
  updateInstitute,
  deactivateInstitute
};
