import React, { useEffect, useState } from "react";
import { batchService, userService } from "../api";
import { mockBatches, mockTeachers, mockStudents } from "../api/mockData";
import { useAuth } from "../context/AuthContext";
import {
  BookOpen,
  Plus,
  Search,
  UserCheck,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function Batches() {
  const { user, isDemoUser } = useAuth();
  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  // Forms
  const [newBatch, setNewBatch] = useState({
    name: "",
    code: "",
    teacher: "",
    startDate: "",
    endDate: "",
  });
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [alert, setAlert] = useState({ type: "", msg: "" });

  const role = user?.role || "student";

  const loadBatches = async () => {
    setLoading(true);
    if (isDemoUser) {
      if (role === "student") {
        setBatches(mockBatches.slice(0, 2));
      } else {
        setBatches(mockBatches);
      }
      setTeachers(mockTeachers);
      setStudents(mockStudents);
      setLoading(false);
      return;
    }

    try {
      if (role === "student") {
        const res = await batchService.getMyBatches();
        const list = res.data?.data?.batches || [];
        setBatches(list.length > 0 ? list : mockBatches.slice(0, 2));
      } else {
        const [batchRes, teachRes, studRes] = await Promise.all([
          batchService.getAll(),
          userService.getTeachers().catch(() => ({ data: { data: { teachers: mockTeachers } } })),
          userService.getStudents().catch(() => ({ data: { data: { students: mockStudents } } })),
        ]);
        const list = batchRes.data?.data?.batches || [];
        setBatches(list.length > 0 ? list : mockBatches);
        setTeachers(teachRes.data?.data?.teachers || mockTeachers);
        setStudents(studRes.data?.data?.students || mockStudents);
      }
    } catch (err) {
      console.warn("API fallback to mock batches:", err);
      setBatches(mockBatches);
      setTeachers(mockTeachers);
      setStudents(mockStudents);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, [role, isDemoUser]);

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setAlert({ type: "", msg: "" });

    try {
      if (!isDemoUser) {
        await batchService.create({
          ...newBatch,
          teacher: newBatch.teacher || undefined,
          startDate: newBatch.startDate || undefined,
          endDate: newBatch.endDate || undefined,
        });
      }
      const teacherObj = teachers.find((t) => t._id === newBatch.teacher);
      const added = {
        _id: `b_${Date.now()}`,
        name: newBatch.name,
        code: newBatch.code.toUpperCase(),
        teacher: teacherObj || null,
        students: [],
        startDate: newBatch.startDate,
        endDate: newBatch.endDate,
        isActive: true,
      };
      setBatches([added, ...batches]);
      setShowCreateModal(false);
      setNewBatch({ name: "", code: "", teacher: "", startDate: "", endDate: "" });
      setAlert({ type: "success", msg: "Batch created successfully!" });
    } catch (err) {
      setAlert({
        type: "error",
        msg: err.response?.data?.message || "Failed to create batch.",
      });
    }
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    if (!selectedBatch || !selectedStudentId) return;
    setAlert({ type: "", msg: "" });

    try {
      if (!isDemoUser) {
        await batchService.enrollStudent(selectedBatch._id, selectedStudentId);
      }
      setBatches(
        batches.map((b) =>
          b._id === selectedBatch._id
            ? { ...b, students: [...(b.students || []), selectedStudentId] }
            : b
        )
      );
      setShowEnrollModal(false);
      setSelectedStudentId("");
      setAlert({ type: "success", msg: "Student enrolled in batch successfully!" });
    } catch (err) {
      setAlert({
        type: "error",
        msg: err.response?.data?.message || "Student may already be enrolled in this batch.",
      });
    }
  };

  const filtered = batches.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {role === "student" ? "My Enrolled Batches" : "Batch & Course Management"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {role === "student"
              ? "View classes, course codes, and assigned faculty."
              : "Organize academic cohorts, assign lead instructors, and enroll students."}
          </p>
        </div>
        {role === "admin" && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition"
          >
            <Plus className="h-4 w-4" />
            Create Batch
          </button>
        )}
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
          placeholder="Filter batches by title or code..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-slate-500">Loading batches...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-600">No batches available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((batch) => (
            <div
              key={batch._id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {batch.code}
                  </span>
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {batch.students?.length || 0} Enrolled
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{batch.name}</h3>

                <div className="space-y-1.5 text-xs text-slate-600 mt-4 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-500">Instructor:</span>
                    <span className="text-slate-800 font-medium">
                      {batch.teacher?.name || "Unassigned"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>
                      {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : "TBD"} –{" "}
                      {batch.endDate ? new Date(batch.endDate).toLocaleDateString() : "TBD"}
                    </span>
                  </div>
                </div>
              </div>

              {role === "admin" && (
                <div className="mt-5 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setSelectedBatch(batch);
                      setShowEnrollModal(true);
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-semibold transition"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    Enroll Student
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Batch */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Create Academic Batch</h2>
            <p className="text-xs text-slate-500 mb-4">
              Add a new batch cohort and optionally link an assigned teacher.
            </p>
            <form onSubmit={handleCreateBatch} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Batch Name
                </label>
                <input
                  type="text"
                  required
                  value={newBatch.name}
                  onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                  placeholder="e.g. Physics Honors 2026"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Code (Unique)
                  </label>
                  <input
                    type="text"
                    required
                    value={newBatch.code}
                    onChange={(e) => setNewBatch({ ...newBatch, code: e.target.value })}
                    placeholder="PHY-202"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assigned Teacher
                  </label>
                  <select
                    value={newBatch.teacher}
                    onChange={(e) => setNewBatch({ ...newBatch, teacher: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Instructor...</option>
                    {teachers.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newBatch.startDate}
                    onChange={(e) => setNewBatch({ ...newBatch, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newBatch.endDate}
                    onChange={(e) => setNewBatch({ ...newBatch, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Create Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Enroll Student */}
      {showEnrollModal && selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Enroll Student into {selectedBatch.name}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Select an active student registered in this institute.
            </p>
            <form onSubmit={handleEnrollStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Choose Student
                </label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Student...</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
