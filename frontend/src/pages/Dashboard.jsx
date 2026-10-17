import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { dashboardService } from "../api";
import { mockDashboardData } from "../api/mockData";
import {
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  TrendingUp,
  CalendarCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function Dashboard() {
  const { user, isDemoUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendAvailable, setBackendAvailable] = useState(false);

  const role = user?.role || "student";

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setLoading(true);

      // If user is explicitly in Demo mode, use enriched realistic mock data
      if (isDemoUser) {
        setData(mockDashboardData[role]);
        setBackendAvailable(false);
        setLoading(false);
        return;
      }

      // Otherwise fetch from connected backend API
      try {
        let res;
        if (role === "superAdmin") {
          res = await dashboardService.getSuperAdminStats();
        } else if (role === "admin") {
          res = await dashboardService.getAdminStats();
        } else if (role === "teacher") {
          res = await dashboardService.getTeacherStats();
        } else {
          res = await dashboardService.getStudentStats();
        }

        if (isMounted) {
          setData(res.data?.data || res.data);
          setBackendAvailable(true);
        }
      } catch (err) {
        console.warn("Backend API unavailable or error occurred, using fallback demo state", err);
        if (isMounted) {
          // Graceful fallback to rich mock data if backend server is not running
          setData(mockDashboardData[role]);
          setBackendAvailable(false);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, [role, isDemoUser]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Loading Dashboard Metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-indigo-700 via-indigo-800 to-violet-800 rounded-2xl p-6 text-white shadow-xl shadow-indigo-900/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs">
              {role.toUpperCase()}
            </span>
            {backendAvailable ? (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-200 text-xs font-semibold border border-emerald-400/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Backend Connected
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/25 text-amber-200 text-xs font-semibold border border-amber-300/30">
                <Sparkles className="h-3 w-3" />
                Preview Mode
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            Welcome back, {user?.name || "Member"}!
          </h1>
          <p className="text-indigo-200 text-sm mt-1">
            {role === "superAdmin"
              ? "Oversee all tenant institutes, license provisioning, and ecosystem metrics."
              : role === "admin"
              ? "Monitor student enrollments, faculty allocation, attendance, and fee collection."
              : role === "teacher"
              ? "View scheduled batches, mark daily student attendance, and evaluate attendance trends."
              : "Track your enrolled batches, attendance punctuality, and tuition fee clearance."}
          </p>
        </div>
      </div>

      {/* RENDER STATS ACCORDING TO ROLE */}
      {role === "superAdmin" && renderSuperAdminView(data)}
      {role === "admin" && renderAdminView(data)}
      {role === "teacher" && renderTeacherView(data)}
      {role === "student" && renderStudentView(data)}
    </div>
  );
}

// 1. Super Admin View
function renderSuperAdminView(data) {
  const institutes = data?.institutes || { total: 0, active: 0, inactive: 0 };
  const users = data?.users || { admins: 0, teachers: 0, students: 0 };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Institutes"
          value={institutes.total}
          subtitle={`${institutes.active} Active tenants`}
          icon={Building2}
          color="indigo"
        />
        <StatCard
          title="Institute Admins"
          value={users.admins}
          subtitle="Enterprise managers"
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Total Teachers"
          value={users.teachers}
          subtitle="Across all academies"
          icon={GraduationCap}
          color="emerald"
        />
        <StatCard
          title="Total Students"
          value={users.students}
          subtitle="Active learners"
          icon={TrendingUp}
          color="blue"
        />
      </div>

      {/* Quick summary panel */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-indigo-600" />
          Multi-Tenant Platform Health
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase">Tenant Ratio</span>
            <p className="text-xl font-bold text-slate-800 mt-1">
              {institutes.total > 0 ? Math.round((institutes.active / institutes.total) * 100) : 100}% Active
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Healthy subscription renewal status</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase">Role Distribution</span>
            <p className="text-xl font-bold text-slate-800 mt-1">
              {users.teachers + users.students} Total Campus Members
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Growing student-to-teacher ratio</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase">System Status</span>
            <div className="flex items-center gap-2 mt-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-sm font-bold text-emerald-700">All Nodes Operational</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">API Rate-limiting & Token Security active</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. Admin View
function renderAdminView(data) {
  const students = data?.students || 0;
  const teachers = data?.teachers || 0;
  const batches = data?.batches || 0;
  const fees = data?.fees || { totalFees: 0, totalCollected: 0, totalOutstanding: 0 };
  const att = data?.attendance || { present: 0, absent: 0, late: 0 };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Enrolled Students"
          value={students}
          subtitle="In your institute"
          icon={GraduationCap}
          color="indigo"
        />
        <StatCard
          title="Assigned Teachers"
          value={teachers}
          subtitle="Active faculty members"
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Active Batches"
          value={batches}
          subtitle="Current semester courses"
          icon={BookOpen}
          color="emerald"
        />
        <StatCard
          title="Collected Fees"
          value={`$${Number(fees.totalCollected || 0).toLocaleString()}`}
          subtitle={`$${Number(fees.totalOutstanding || 0).toLocaleString()} pending`}
          icon={DollarSign}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-indigo-600" />
            Attendance Activity Summary
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <p className="text-2xl font-bold text-emerald-700">{att.present || 0}</p>
              <p className="text-xs font-semibold text-emerald-800 mt-1 uppercase">Present</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-2xl font-bold text-amber-700">{att.late || 0}</p>
              <p className="text-xs font-semibold text-amber-800 mt-1 uppercase">Late</p>
            </div>
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-100">
              <p className="text-2xl font-bold text-rose-700">{att.absent || 0}</p>
              <p className="text-xs font-semibold text-rose-800 mt-1 uppercase">Absent</p>
            </div>
          </div>
        </div>

        {/* Financial Collection Meter */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            Fee Collection Ratio
          </h3>
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
              <span>Collected: ${fees.totalCollected?.toLocaleString()}</span>
              <span>Total: ${fees.totalFees?.toLocaleString()}</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    fees.totalFees > 0
                      ? Math.min(100, Math.round((fees.totalCollected / fees.totalFees) * 100))
                      : 0
                  }%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
              <span>
                {fees.totalFees > 0
                  ? `${Math.round((fees.totalCollected / fees.totalFees) * 100)}% Cleared`
                  : "No fees recorded yet"}
              </span>
              <span className="font-semibold text-rose-600">
                Outstanding: ${fees.totalOutstanding?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. Teacher View
function renderTeacherView(data) {
  const batches = data?.batches || [];
  const totalStudents = data?.totalStudents || 0;
  const att = data?.attendance || { present: 0, absent: 0, late: 0, total: 0 };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Assigned Batches"
          value={data?.totalBatches || batches.length}
          subtitle="Courses under your instruction"
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          title="Students Taught"
          value={totalStudents}
          subtitle="Total unique attendees"
          icon={GraduationCap}
          color="purple"
        />
        <StatCard
          title="Attendance Sessions"
          value={att.total || 0}
          subtitle={`${att.present || 0} presents recorded`}
          icon={CalendarCheck}
          color="emerald"
        />
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-600" />
          My Teaching Schedule & Batches
        </h3>
        {batches.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">No active batches assigned currently.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {batches.map((batch) => (
              <div
                key={batch._id}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all bg-slate-50/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                    {batch.code}
                  </span>
                  <span className="text-xs text-slate-500">
                    {batch.students?.length || 0} Students
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900">{batch.name}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Term: {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : "TBD"} –{" "}
                  {batch.endDate ? new Date(batch.endDate).toLocaleDateString() : "TBD"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 4. Student View
function renderStudentView(data) {
  const fees = data?.fees || { totalFees: 0, totalPaid: 0, totalOutstanding: 0 };
  const att = data?.attendance || { attendancePercentage: 0, present: 0, absent: 0, late: 0, total: 0 };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Attendance Score"
          value={`${att.attendancePercentage || 0}%`}
          subtitle={`${att.present || 0} / ${att.total || 0} classes attended`}
          icon={CalendarCheck}
          color="emerald"
        />
        <StatCard
          title="Enrolled Batches"
          value={data?.totalBatches || 0}
          subtitle="Courses in progress"
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          title="Fee Balance"
          value={`$${Number(fees.totalOutstanding || 0).toLocaleString()}`}
          subtitle={`Paid: $${Number(fees.totalPaid || 0).toLocaleString()}`}
          icon={DollarSign}
          color={fees.totalOutstanding > 0 ? "rose" : "emerald"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-emerald-600" />
            Attendance History Ratio
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Present & On-time</span>
                <span>{att.present || 0} sessions</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${att.total > 0 ? (att.present / att.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Late Arrivals</span>
                <span>{att.late || 0} sessions</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${att.total > 0 ? (att.late / att.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Absences</span>
                <span>{att.absent || 0} sessions</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{
                    width: `${att.total > 0 ? (att.absent / att.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-indigo-600" />
              Tuition Summary
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Billed:</span>
                <span className="font-semibold text-slate-900">${fees.totalFees?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Amount Cleared:</span>
                <span className="font-semibold text-emerald-600">${fees.totalPaid?.toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold">
                <span className="text-slate-700">Due Amount:</span>
                <span className={fees.totalOutstanding > 0 ? "text-rose-600" : "text-emerald-600"}>
                  ${fees.totalOutstanding?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Receipts and digital invoices are available under the "Fee Invoices" menu.
          </p>
        </div>
      </div>
    </div>
  );
}

// Reusable Metric Stat Card Component
function StatCard({ title, value, subtitle, icon: Icon, color = "indigo" }) {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl border ${colorMap[color] || colorMap.indigo}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-black text-slate-900 tracking-tight">{value}</div>
        <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>
      </div>
    </div>
  );
}
