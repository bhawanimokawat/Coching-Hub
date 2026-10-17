import React, { useEffect, useState } from "react";
import { userService } from "../api";
import { mockTeachers } from "../api/mockData";
import { useAuth } from "../context/AuthContext";
import { Users, Plus, Search, Mail, CheckCircle2, AlertCircle } from "lucide-react";

export default function Teachers() {
  const { isDemoUser } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ name: "", email: "", password: "" });
  const [alert, setAlert] = useState({ type: "", msg: "" });

  const loadTeachers = async () => {
    setLoading(true);
    if (isDemoUser) {
      setTeachers(mockTeachers);
      setLoading(false);
      return;
    }

    try {
      const res = await userService.getTeachers();
      const list = res.data?.data?.teachers || [];
      setTeachers(list.length > 0 ? list : mockTeachers);
    } catch (err) {
      console.warn("API fallback to mock teachers:", err);
      setTeachers(mockTeachers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, [isDemoUser]);

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    setAlert({ type: "", msg: "" });

    try {
      if (!isDemoUser) {
        await userService.createInstituteUser({
          ...newTeacher,
          role: "teacher",
        });
      }
      const added = {
        _id: `u_teach_${Date.now()}`,
        name: newTeacher.name,
        email: newTeacher.email,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      setTeachers([added, ...teachers]);
      setShowAddModal(false);
      setNewTeacher({ name: "", email: "", password: "" });
      setAlert({ type: "success", msg: "Faculty member added successfully!" });
    } catch (err) {
      setAlert({
        type: "error",
        msg: err.response?.data?.message || "Failed to add faculty member.",
      });
    }
  };

  const filtered = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Faculty Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage teaching staff and course instructors for this campus.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition"
        >
          <Plus className="h-4 w-4" />
          Add Faculty Member
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
          placeholder="Search teachers by name or email..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-slate-500">Loading faculty list...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <Users className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-600">No teachers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((t) => (
            <div
              key={t._id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-indigo-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm shadow-xs">
                  {t.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{t.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate mt-0.5">
                    <Mail className="h-3 w-3" />
                    {t.email}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active Faculty
                </span>
                <span className="text-slate-400">
                  Joined: {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "Active"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Faculty */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Add Faculty Member</h2>
            <p className="text-xs text-slate-500 mb-4">
              Create an instructor account capable of batch instruction and attendance recording.
            </p>
            <form onSubmit={handleCreateTeacher} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                  placeholder="e.g. Dr. Robert Langdon"
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
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                  placeholder="teacher@institute.edu"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Temporary Password (min 8 characters)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newTeacher.password}
                  onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
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
                  Add Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
