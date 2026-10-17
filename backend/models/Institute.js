
const mongoose = require("mongoose");

const instituteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Institute name is required"],
      trim: true,
      maxlength: [100, "Institute name cannot exceed 100 characters"],
    },

    code: {
      type: String,
      required: [true, "Institute code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Institute email is required"],
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Institute", instituteSchema);
