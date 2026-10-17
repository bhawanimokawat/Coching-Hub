
const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema(
  {
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "partial", "paid"],
      default: "pending",
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

feeSchema.index({ institute: 1, student: 1 });

module.exports = mongoose.model("Fee", feeSchema);
