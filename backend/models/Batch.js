
const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Batch name is required"],
      trim: true,
      maxlength: [100, "Batch name cannot exceed 100 characters"],
    },

    code: {
      type: String,
      required: [true, "Batch code is required"],
      trim: true,
      uppercase: true,
    },

    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
      index: true,
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    startDate: {
      type: Date,
      default: null,
    },

    endDate: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

batchSchema.index(
  { institute: 1, code: 1 },
  { unique: true }
);

module.exports = mongoose.model("Batch", batchSchema);
