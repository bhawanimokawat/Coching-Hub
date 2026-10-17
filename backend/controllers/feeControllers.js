
const mongoose = require("mongoose");
const Fee = require("../models/fee");
const Batch = require("../models/Batch");
const User = require("../models/user");
const asyncHandler = require("../utils/asyncHandler");
const sendResponse = require("../utils/apiResponse");
const Payment = require("../models/payment");

const createFee = asyncHandler(async (req, res) => {
  const { studentId, batchId, title, amount, dueDate } = req.body;

  if (
    !mongoose.isValidObjectId(studentId) ||
    !mongoose.isValidObjectId(batchId)
  ) {
    res.status(400);
    throw new Error("Valid studentId and batchId are required.");
  }

  if (
    typeof title !== "string" ||
    !title.trim() ||
    title.trim().length > 100
  ) {
    res.status(400);
    throw new Error("Title is required and must not exceed 100 characters.");
  }

  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    res.status(400);
    throw new Error("Amount must be a positive number.");
  }

  if (
    typeof dueDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dueDate) ||
    !Number.isFinite(Date.parse(dueDate)) ||
    new Date(dueDate).toISOString().slice(0, 10) !== dueDate
  ) {
    res.status(400);
    throw new Error("Due date must be a valid YYYY-MM-DD date.");
  }

  const batch = await Batch.findOne({
    _id: batchId,
    institute: req.instituteId,
    isActive: true,
  });

  if (!batch) {
    res.status(404);
    throw new Error("Active batch not found in your institute.");
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

  const isEnrolled = batch.students.some(
    (id) => String(id) === String(student._id)
  );

  if (!isEnrolled) {
    res.status(400);
    throw new Error("Student is not enrolled in this batch.");
  }

  const fee = await Fee.create({
    institute: req.instituteId,
    student: student._id,
    batch: batch._id,
    title: title.trim(),
    amount,
    dueDate: new Date(`${dueDate}T00:00:00.000Z`),
    recordedBy: req.user._id,
  });

  return sendResponse(res, 201, "Fee record created successfully.", {
    fee,
  });
});


const getFees = asyncHandler(async (req, res) => {
  const fees = await Fee.find({
    institute: req.instituteId,
  })
    .populate("student", "name email")
    .populate("batch", "name code")
    .populate("recordedBy", "name")
    .sort({ createdAt: -1 })
    .limit(500);

  return sendResponse(res, 200, "Fees fetched successfully.", {
    count: fees.length,
    fees,
  });
});


const recordFeePayment = asyncHandler(async (req, res) => {
  const { feeId } = req.params;
  const { amount, method = "cash", reference, paymentDate } = req.body;

  if (!mongoose.isValidObjectId(feeId)) {
    res.status(400);
    throw new Error("Invalid fee ID.");
  }

  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    res.status(400);
    throw new Error("Payment amount must be a positive number.");
  }

  const allowedMethods = [
    "cash",
    "upi",
    "bank_transfer",
    "card",
    "other",
  ];

  if (!allowedMethods.includes(method)) {
    res.status(400);
    throw new Error("Invalid payment method.");
  }

  let parsedPaymentDate = new Date();

  if (paymentDate !== undefined) {
    if (
      typeof paymentDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(paymentDate) ||
      !Number.isFinite(Date.parse(paymentDate)) ||
      new Date(paymentDate).toISOString().slice(0, 10) !== paymentDate
    ) {
      res.status(400);
      throw new Error("Payment date must be a valid YYYY-MM-DD date.");
    }

    parsedPaymentDate = new Date(`${paymentDate}T00:00:00.000Z`);
  }

  if (reference !== undefined && typeof reference !== "string") {
    res.status(400);
    throw new Error("Payment reference must be text.");
  }

  const session = await mongoose.startSession();

  try {
    let createdPayment;

    await session.withTransaction(async () => {
      const fee = await Fee.findOne({
        _id: feeId,
        institute: req.instituteId,
      }).session(session);

      if (!fee) {
        res.status(404);
        throw new Error("Fee record not found in your institute.");
      }

      const outstanding = Math.round(
        (fee.amount - fee.paidAmount) * 100
      ) / 100;

      if (outstanding <= 0) {
        res.status(400);
        throw new Error("This fee has already been fully paid.");
      }

      if (amount > outstanding) {
        res.status(400);
        throw new Error(
          `Payment exceeds the outstanding balance of ${outstanding}.`
        );
      }

      const updatedPaidAmount =
        Math.round((fee.paidAmount + amount) * 100) / 100;

      fee.paidAmount = updatedPaidAmount;
      fee.status =
        updatedPaidAmount >= fee.amount ? "paid" : "partial";

      await fee.save({ session });

      const payments = await Payment.create(
        [
          {
            institute: req.instituteId,
            fee: fee._id,
            student: fee.student,
            amount,
            method,
            reference: reference?.trim(),
            paymentDate: parsedPaymentDate,
            recordedBy: req.user._id,
          },
        ],
        { session }
      );

      createdPayment = payments[0];
    });

    return sendResponse(
      res,
      201,
      "Fee payment recorded successfully.",
      { payment: createdPayment }
    );
  } finally {
    await session.endSession();
  }
});


const getFeePayments = asyncHandler(async (req, res) => {
  const { feeId } = req.params;

  if (!mongoose.isValidObjectId(feeId)) {
    res.status(400);
    throw new Error("Invalid fee ID.");
  }

  const fee = await Fee.findOne({
    _id: feeId,
    institute: req.instituteId,
  }).select("_id student title amount paidAmount status");

  if (!fee) {
    res.status(404);
    throw new Error("Fee record not found in your institute.");
  }

  const payments = await Payment.find({
    institute: req.instituteId,
    fee: fee._id,
  })
    .populate("recordedBy", "name")
    .sort({ paymentDate: -1, createdAt: -1 })
    .limit(500);

  return sendResponse(res, 200, "Payment history fetched successfully.", {
    fee,
    count: payments.length,
    payments,
  });
});


const getMyFees = asyncHandler(async (req, res) => {
  const fees = await Fee.find({
    institute: req.instituteId,
    student: req.user._id,
  })
    .populate("batch", "name code")
    .sort({ dueDate: 1 })
    .limit(200);

  const totalFees = fees.reduce(
    (sum, fee) => sum + fee.amount,
    0
  );

  const totalPaid = fees.reduce(
    (sum, fee) => sum + fee.paidAmount,
    0
  );

  const totalOutstanding = Math.max(
    0,
    Math.round((totalFees - totalPaid) * 100) / 100
  );

  return sendResponse(
    res,
    200,
    "Your fee records fetched successfully.",
    {
      count: fees.length,
      summary: {
        totalFees: Number(totalFees.toFixed(2)),
        totalPaid: Number(totalPaid.toFixed(2)),
        totalOutstanding,
      },
      fees,
    }
  );
});
 
module.exports = { createFee,getFees,recordFeePayment,getFeePayments,getMyFees };
