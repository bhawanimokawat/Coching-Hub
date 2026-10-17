import api from "./axios";

// Auth Services
export const authService = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (data) => api.post("/auth/register", data),
  logout: () => api.post("/auth/logout"),
};

// User & Profile Services
export const userService = {
  getProfile: () => api.get("/users/me"),
  getAllUsers: () => api.get("/users"), // SuperAdmin
  createInstituteAdmin: (data) => api.post("/users/create-admin", data), // SuperAdmin
  createInstituteUser: (data) => api.post("/users", data), // Admin (teacher/student)
  getStudents: () => api.get("/users/students"), // Admin
  getTeachers: () => api.get("/users/teachers"), // Admin
  updateStudentStatus: (studentId, isActive) =>
    api.patch(`/users/students/${studentId}/status`, { isActive }),
  assignStudentToInstitute: (studentId) =>
    api.patch(`/users/${studentId}/assign-institute`),
};

// Institute Services (SuperAdmin)
export const instituteService = {
  getAll: () => api.get("/institutes"),
  create: (data) => api.post("/institutes", data),
  update: (id, data) => api.patch(`/institutes/${id}`, data),
  deactivate: (id) => api.delete(`/institutes/${id}`),
};

// Batch Services
export const batchService = {
  getAll: () => api.get("/batches"),
  create: (data) => api.post("/batches", data),
  update: (batchId, data) => api.patch(`/batches/${batchId}`, data),
  enrollStudent: (batchId, studentId) =>
    api.post(`/batches/${batchId}/enroll`, { studentId }),
  getMyBatches: () => api.get("/batches/my-batches"), // Student
};

// Attendance Services
export const attendanceService = {
  mark: (data) => api.post("/attendance", data), // Admin / Teacher
  getByBatch: (batchId) => api.get(`/attendance/batch/${batchId}`), // Admin / Teacher
  getMyAttendance: () => api.get("/attendance/my-attendance"), // Student
};

// Fee & Payment Services
export const feeService = {
  getAll: () => api.get("/fees"), // Admin
  create: (data) => api.post("/fees", data), // Admin
  recordPayment: (feeId, data) => api.post(`/fees/${feeId}/payments`, data), // Admin
  getPayments: (feeId) => api.get(`/fees/${feeId}/payments`), // Admin
  getMyFees: () => api.get("/fees/my-fees"), // Student
};

// Dashboard Services by Role
export const dashboardService = {
  getAdminStats: () => api.get("/dashboard"),
  getTeacherStats: () => api.get("/teacher-dashboard"),
  getStudentStats: () => api.get("/student-dashboard"),
  getSuperAdminStats: () => api.get("/super-admin-dashboard"),
  checkHealth: () => api.get("/health"),
};
