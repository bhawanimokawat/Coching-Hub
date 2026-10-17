
const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
      index: true,
    },

    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["present", "absent", "late"],
      required: true,
    },

    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

attendanceSchema.index(
  { institute: 1, batch: 1, student: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
