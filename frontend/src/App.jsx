import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Institutes from "./pages/Institutes";
import AllUsers from "./pages/AllUsers";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Batches from "./pages/Batches";
import Attendance from "./pages/Attendance";
import Fees from "./pages/Fees";

function App() {
  return (
    <Routes>
      {/* Public Authentication Pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Authenticated Application Pages inside DashboardLayout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Super Admin Exclusive Pages */}
      <Route
        path="/institutes"
        element={
          <ProtectedRoute allowedRoles={["superAdmin"]}>
            <DashboardLayout>
              <Institutes />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={["superAdmin"]}>
            <DashboardLayout>
              <AllUsers />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Exclusive Directory Pages */}
      <Route
        path="/students"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout>
              <Students />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teachers"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout>
              <Teachers />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Batches (Admin, Teacher, Student) */}
      <Route
        path="/batches"
        element={
          <ProtectedRoute allowedRoles={["admin", "teacher", "student"]}>
            <DashboardLayout>
              <Batches />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Attendance (Admin, Teacher, Student) */}
      <Route
        path="/attendance"
        element={
          <ProtectedRoute allowedRoles={["admin", "teacher", "student"]}>
            <DashboardLayout>
              <Attendance />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Fees (Admin, Student) */}
      <Route
        path="/fees"
        element={
          <ProtectedRoute allowedRoles={["admin", "student"]}>
            <DashboardLayout>
              <Fees />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Default Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
