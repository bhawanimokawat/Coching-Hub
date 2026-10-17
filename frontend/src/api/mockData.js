export const mockDashboardData = {
  superAdmin: {
    institutes: { total: 14, active: 12, inactive: 2 },
    users: { admins: 18, teachers: 94, students: 1420 },
  },
  admin: {
    students: 184,
    teachers: 16,
    batches: 12,
    fees: {
      totalFees: 345000,
      totalCollected: 278000,
      totalOutstanding: 67000,
      feeRecords: 184,
    },
    attendance: {
      present: 156,
      absent: 18,
      late: 10,
    },
  },
  teacher: {
    totalBatches: 4,
    totalStudents: 92,
    attendance: {
      total: 120,
      present: 102,
      absent: 12,
      late: 6,
    },
    batches: [
      { _id: "b1", name: "Physics Honors Batch A", code: "PHY-301", students: Array(28).fill(null), startDate: "2026-08-01", endDate: "2026-12-20" },
      { _id: "b2", name: "Applied Mechanics B", code: "MEC-202", students: Array(24).fill(null), startDate: "2026-08-15", endDate: "2026-12-15" },
      { _id: "b3", name: "Thermodynamics Lab", code: "THM-401", students: Array(22).fill(null), startDate: "2026-09-01", endDate: "2027-01-30" },
      { _id: "b4", name: "Quantum Fundamentals", code: "QNT-101", students: Array(18).fill(null), startDate: "2026-09-10", endDate: "2027-02-15" },
    ],
  },
  student: {
    student: {
      name: "Aiden Sharma",
      email: "aiden.sharma@apexacademy.edu",
      role: "student",
      institute: "inst_apex_01",
    },
    totalBatches: 3,
    fees: {
      totalFees: 45000,
      totalPaid: 35000,
      totalOutstanding: 10000,
    },
    attendance: {
      total: 48,
      present: 42,
      absent: 4,
      late: 2,
      attendancePercentage: 91.67,
    },
  },
};

export const mockInstitutes = [
  { _id: "inst_1", name: "Apex Science & Tech Academy", code: "APEX-01", email: "contact@apexacademy.edu", phone: "+1 (555) 234-5678", address: "100 Innovation Way, Boston, MA", isActive: true, createdAt: "2026-01-10T00:00:00.000Z" },
  { _id: "inst_2", name: "Metropolitan Coding Institute", code: "METRO-02", email: "info@metroinstitute.org", phone: "+1 (555) 876-5432", address: "45 Silicon Boulevard, Austin, TX", isActive: true, createdAt: "2026-02-14T00:00:00.000Z" },
  { _id: "inst_3", name: "Oakridge Business Academy", code: "OAK-03", email: "admissions@oakridge.edu", phone: "+1 (555) 345-6789", address: "78 Park Crescent, Chicago, IL", isActive: true, createdAt: "2026-03-01T00:00:00.000Z" },
  { _id: "inst_4", name: "Horizon Polytech Center", code: "HORIZON-04", email: "admin@horizonpoly.edu", phone: "+1 (555) 987-1234", address: "12 Gateway Road, Seattle, WA", isActive: false, createdAt: "2026-03-20T00:00:00.000Z" },
];

export const mockUsers = [
  { _id: "u1", name: "Principal Sarah Jenkins", email: "admin@apexacademy.edu", role: "admin", institute: { name: "Apex Science & Tech Academy", code: "APEX-01" }, isActive: true, createdAt: "2026-01-12T00:00:00.000Z" },
  { _id: "u2", name: "Dean Robert Vance", email: "dean@metroinstitute.org", role: "admin", institute: { name: "Metropolitan Coding Institute", code: "METRO-02" }, isActive: true, createdAt: "2026-02-15T00:00:00.000Z" },
  { _id: "u3", name: "Prof. Michael Chang", email: "mchang@apexacademy.edu", role: "teacher", institute: { name: "Apex Science & Tech Academy", code: "APEX-01" }, isActive: true, createdAt: "2026-01-20T00:00:00.000Z" },
  { _id: "u4", name: "Dr. Elena Rostova", email: "erostova@apexacademy.edu", role: "teacher", institute: { name: "Apex Science & Tech Academy", code: "APEX-01" }, isActive: true, createdAt: "2026-01-22T00:00:00.000Z" },
  { _id: "u5", name: "Aiden Sharma", email: "aiden.sharma@apexacademy.edu", role: "student", institute: { name: "Apex Science & Tech Academy", code: "APEX-01" }, isActive: true, createdAt: "2026-02-01T00:00:00.000Z" },
  { _id: "u6", name: "Sophia Martinez", email: "sophia.m@apexacademy.edu", role: "student", institute: { name: "Apex Science & Tech Academy", code: "APEX-01" }, isActive: true, createdAt: "2026-02-03T00:00:00.000Z" },
];

export const mockBatches = [
  { _id: "b1", name: "Physics Honors Batch A", code: "PHY-301", teacher: { _id: "u3", name: "Prof. Michael Chang", email: "mchang@apexacademy.edu" }, students: ["u5", "u6"], startDate: "2026-08-01", endDate: "2026-12-20", isActive: true },
  { _id: "b2", name: "Advanced Computer Architecture", code: "CS-402", teacher: { _id: "u4", name: "Dr. Elena Rostova", email: "erostova@apexacademy.edu" }, students: ["u5"], startDate: "2026-08-15", endDate: "2026-12-15", isActive: true },
  { _id: "b3", name: "Discrete Mathematics 101", code: "MTH-101", teacher: { _id: "u3", name: "Prof. Michael Chang", email: "mchang@apexacademy.edu" }, students: ["u6"], startDate: "2026-09-01", endDate: "2027-01-30", isActive: true },
];

export const mockStudents = [
  { _id: "u5", name: "Aiden Sharma", email: "aiden.sharma@apexacademy.edu", isActive: true, createdAt: "2026-02-01T00:00:00.000Z" },
  { _id: "u6", name: "Sophia Martinez", email: "sophia.m@apexacademy.edu", isActive: true, createdAt: "2026-02-03T00:00:00.000Z" },
  { _id: "u7", name: "Liam Johnson", email: "liam.j@apexacademy.edu", isActive: true, createdAt: "2026-02-05T00:00:00.000Z" },
  { _id: "u8", name: "Emma Watson", email: "emma.w@apexacademy.edu", isActive: false, createdAt: "2026-02-08T00:00:00.000Z" },
];

export const mockTeachers = [
  { _id: "u3", name: "Prof. Michael Chang", email: "mchang@apexacademy.edu", isActive: true, createdAt: "2026-01-20T00:00:00.000Z" },
  { _id: "u4", name: "Dr. Elena Rostova", email: "erostova@apexacademy.edu", isActive: true, createdAt: "2026-01-22T00:00:00.000Z" },
  { _id: "u9", name: "David Kim", email: "dkim@apexacademy.edu", isActive: true, createdAt: "2026-01-25T00:00:00.000Z" },
];

export const mockFees = [
  { _id: "f1", title: "Fall Semester Tuition 2026", amount: 25000, paidAmount: 25000, status: "paid", dueDate: "2026-09-15T00:00:00.000Z", student: { _id: "u5", name: "Aiden Sharma", email: "aiden.sharma@apexacademy.edu" }, batch: { _id: "b1", name: "Physics Honors Batch A", code: "PHY-301" } },
  { _id: "f2", title: "Laboratory & Material Fee", amount: 10000, paidAmount: 5000, status: "partial", dueDate: "2026-10-30T00:00:00.000Z", student: { _id: "u5", name: "Aiden Sharma", email: "aiden.sharma@apexacademy.edu" }, batch: { _id: "b1", name: "Physics Honors Batch A", code: "PHY-301" } },
  { _id: "f3", title: "Annual Registration & Library", amount: 15000, paidAmount: 0, status: "pending", dueDate: "2026-11-10T00:00:00.000Z", student: { _id: "u6", name: "Sophia Martinez", email: "sophia.m@apexacademy.edu" }, batch: { _id: "b2", name: "Advanced Computer Architecture", code: "CS-402" } },
];

export const mockAttendanceRecords = [
  { _id: "att_1", date: "2026-10-15T00:00:00.000Z", status: "present", student: { _id: "u5", name: "Aiden Sharma", email: "aiden.sharma@apexacademy.edu" }, batch: { _id: "b1", name: "Physics Honors Batch A", code: "PHY-301" }, markedBy: { name: "Prof. Michael Chang" } },
  { _id: "att_2", date: "2026-10-14T00:00:00.000Z", status: "present", student: { _id: "u5", name: "Aiden Sharma", email: "aiden.sharma@apexacademy.edu" }, batch: { _id: "b1", name: "Physics Honors Batch A", code: "PHY-301" }, markedBy: { name: "Prof. Michael Chang" } },
  { _id: "att_3", date: "2026-10-13T00:00:00.000Z", status: "late", student: { _id: "u5", name: "Aiden Sharma", email: "aiden.sharma@apexacademy.edu" }, batch: { _id: "b1", name: "Physics Honors Batch A", code: "PHY-301" }, markedBy: { name: "Prof. Michael Chang" } },
  { _id: "att_4", date: "2026-10-12T00:00:00.000Z", status: "absent", student: { _id: "u5", name: "Aiden Sharma", email: "aiden.sharma@apexacademy.edu" }, batch: { _id: "b1", name: "Physics Honors Batch A", code: "PHY-301" }, markedBy: { name: "Prof. Michael Chang" } },
  { _id: "att_5", date: "2026-10-15T00:00:00.000Z", status: "present", student: { _id: "u6", name: "Sophia Martinez", email: "sophia.m@apexacademy.edu" }, batch: { _id: "b1", name: "Physics Honors Batch A", code: "PHY-301" }, markedBy: { name: "Prof. Michael Chang" } },
];
