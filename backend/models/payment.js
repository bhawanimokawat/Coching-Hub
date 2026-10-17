const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
      index: true,
    },
    fee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fee",
      required: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    method: {
      type: String,
      enum: ["cash", "upi", "bank_transfer", "card", "other"],
      default: "cash",
    },
    reference: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ institute: 1, student: 1, paymentDate: -1 });

module.exports = mongoose.model("Payment", paymentSchema);