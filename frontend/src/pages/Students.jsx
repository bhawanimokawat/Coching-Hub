import React, { useEffect, useState } from "react";
import { userService } from "../api";
import { mockStudents } from "../api/mockData";
import { useAuth } from "../context/AuthContext";
import {
  GraduationCap,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Mail,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
} from "lucide-react";

export default function Students() {
  const { isDemoUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", email: "", password: "" });
  const [alert, setAlert] = useState({ type: "", msg: "" });

  const loadStudents = async () => {
    setLoading(true);
    if (isDemoUser) {
      setStudents(mockStudents);
      setLoading(false);
      return;
    }

    try {
      const res = await userService.getStudents();
      const list = res.data?.data?.students || [];
      setStudents(list.length > 0 ? list : mockStudents);
    } catch (err) {
      console.warn("API fallback to mock students:", err);
      setStudents(mockStudents);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [isDemoUser]);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setAlert({ type: "", msg: "" });
    try {
      if (!isDemoUser) {
        await userService.createInstituteUser({
          ...newStudent,
          role: "student",
        });
      }
      const added = {
        _id: `u_stud_${Date.now()}`,
        name: newStudent.name,
        email: newStudent.email,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      setStudents([added, ...students]);
      setShowAddModal(false);
      setNewStudent({ name: "", email: "", password: "" });
      setAlert({ type: "success", msg: "Student enrolled successfully!" });
    } catch (err) {
      setAlert({
        type: "error",
        msg: err.response?.data?.message || "Failed to create student.",
      });
    }
  };

  const handleToggleStatus = async (student) => {
    const nextStatus = !student.isActive;
    try {
      if (!isDemoUser) {
        await userService.updateStudentStatus(student._id, nextStatus);
      }
      setStudents(
        students.map((s) => (s._id === student._id ? { ...s, isActive: nextStatus } : s))
      );
      setAlert({
        type: "success",
        msg: `Updated status for ${student.name} to ${nextStatus ? "Active" : "Disabled"}.`,
      });
    } catch (err) {
      setAlert({ type: "error", msg: "Failed to update status." });
    }
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Register students into your institute and control enrollment permissions.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition"
        >
          <Plus className="h-4 w-4" />
          Enroll New Student
        </button>
      </div>

      {alert.msg && (
        <div
          className={`p-3.5 rounded-xl text-sm font-medium flex items-center gap-2 ${
            alert.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {alert.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          {alert.msg}
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter students by name or email..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-slate-500">Loading student directory...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <GraduationCap className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-600">No students found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Enrolled Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                          {student.name[0]}
                        </div>
                        {student.name}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">{student.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          student.isActive !== false
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            student.isActive !== false ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        />
                        {student.isActive !== false ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {student.createdAt
                        ? new Date(student.createdAt).toLocaleDateString()
                        : "Current Term"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(student)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition ${
                          student.isActive !== false
                            ? "text-rose-600 hover:bg-rose-50"
                            : "text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        {student.isActive !== false ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Enroll Student */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Enroll New Student</h2>
            <p className="text-xs text-slate-500 mb-4">
              Add student to this institute's user roster.
            </p>
            <form onSubmit={handleCreateStudent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  placeholder="e.g. Liam Johnson"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  placeholder="student@example.com"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Initial Password (min 8 characters)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newStudent.password}
                  onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
