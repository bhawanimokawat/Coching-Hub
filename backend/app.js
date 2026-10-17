
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const errorMiddleware = require("./middleware/errormiddleware");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const instituteRoutes = require("./routes/instituteRoutes");
const batchRoutes = require("./routes/batchRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const feeRoutes = require("./routes/feeRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const studentDashboardRoutes = require("./routes/studentDashboardRoutes");
const teacherDashboardRoutes = require("./routes/teacherDashboardRoutes");
const superAdminDashboardRoutes = require("./routes/superAdminDashboardRoutes");

const app = express();

app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(cors());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "InstituteHub API is running",
    environment: process.env.NODE_ENV || "development",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/institutes", instituteRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/student-dashboard", studentDashboardRoutes);
app.use("/api/teacher-dashboard", teacherDashboardRoutes);
app.use("/api/super-admin-dashboard", superAdminDashboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// Global error handler must be registered last
app.use(errorMiddleware);

module.exports = app;
