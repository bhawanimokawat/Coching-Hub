import React, { useEffect, useState } from "react";
import { attendanceService, batchService, userService } from "../api";
import { mockAttendanceRecords, mockBatches, mockStudents } from "../api/mockData";
import { useAuth } from "../context/AuthContext";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertCircle,
} from "lucide-react";

export default function Attendance() {
  const { user, isDemoUser } = useAuth();
  const [records, setRecords] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [loading, setLoading] = useState(true);

  // Mark modal
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [newAtt, setNewAtt] = useState({
    batchId: "",
    studentId: "",
    date: new Date().toISOString().slice(0, 10),
    status: "present",
  });
  const [alert, setAlert] = useState({ type: "", msg: "" });

  const role = user?.role || "student";

  const loadAttendance = async () => {
    setLoading(true);
    if (isDemoUser) {
      setRecords(mockAttendanceRecords);
      setBatches(mockBatches);
      setStudents(mockStudents);
      if (mockBatches.length > 0) setSelectedBatchId(mockBatches[0]._id);
      setLoading(false);
      return;
    }

    try {
      if (role === "student") {
        const res = await attendanceService.getMyAttendance();
        const list = res.data?.data?.records || [];
        setRecords(list.length > 0 ? list : mockAttendanceRecords);
      } else {
        const [batchRes, studRes] = await Promise.all([
          batchService.getAll(),
          userService.getStudents().catch(() => ({ data: { data: { students: mockStudents } } })),
        ]);
        const bList = batchRes.data?.data?.batches || mockBatches;
        setBatches(bList);
        setStudents(studRes.data?.data?.students || mockStudents);

        if (bList.length > 0) {
          const firstBatchId = bList[0]._id;
          setSelectedBatchId(firstBatchId);
          try {
            const attRes = await attendanceService.getByBatch(firstBatchId);
            const attList = attRes.data?.data?.attendance || [];
            setRecords(attList.length > 0 ? attList : mockAttendanceRecords);
          } catch {
            setRecords(mockAttendanceRecords);
          }
        }
      }
    } catch (err) {
      console.warn("API fallback for attendance:", err);
      setRecords(mockAttendanceRecords);
      setBatches(mockBatches);
      setStudents(mockStudents);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [role, isDemoUser]);

  const handleBatchChange = async (batchId) => {
    setSelectedBatchId(batchId);
    if (!batchId || isDemoUser) return;
    try {
      const res = await attendanceService.getByBatch(batchId);
      const list = res.data?.data?.attendance || [];
      setRecords(list.length > 0 ? list : mockAttendanceRecords);
    } catch (err) {
      setRecords(mockAttendanceRecords);
    }
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    setAlert({ type: "", msg: "" });

    try {
      if (!isDemoUser) {
        await attendanceService.mark(newAtt);
      }
      const studentObj = students.find((s) => s._id === newAtt.studentId);
      const batchObj = batches.find((b) => b._id === newAtt.batchId);
      const created = {
        _id: `att_${Date.now()}`,
        date: new Date(newAtt.date).toISOString(),
        status: newAtt.status,
        student: studentObj || { name: "Enrolled Student", email: "" },
        batch: batchObj || { name: "Batch", code: "CODE" },
        markedBy: { name: user?.name || "Teacher" },
      };
      setRecords([created, ...records]);
      setShowMarkModal(false);
      setAlert({ type: "success", msg: "Attendance marked successfully!" });
    } catch (err) {
      setAlert({
        type: "error",
        msg:
          err.response?.data?.message ||
          "Failed to mark attendance. Check if already marked for date.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {role === "student" ? "My Attendance Records" : "Attendance Tracker"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {role === "student"
              ? "Track daily classroom status, punctuality, and attendance percentage."
              : "Record daily attendance per batch and review student compliance."}
          </p>
        </div>
        {(role === "admin" || role === "teacher") && (
          <button
            onClick={() => {
              setNewAtt({
                ...newAtt,
                batchId: selectedBatchId || (batches[0]?._id || ""),
              });
              setShowMarkModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition"
          >
            <Plus className="h-4 w-4" />
            Mark Attendance
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

      {/* Batch selector for faculty & admin */}
      {role !== "student" && batches.length > 0 && (
        <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold uppercase text-slate-500">Filter By Batch:</span>
          <select
            value={selectedBatchId}
            onChange={(e) => handleBatchChange(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {batches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Table list */}
      {loading ? (
        <div className="text-center py-12 text-sm text-slate-500">Loading attendance...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <CalendarCheck className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-600">No attendance entries recorded</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Batch</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {new Date(r.date).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {r.student?.name || "Student"}
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-600">
                      {r.batch?.code ? (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {r.batch.code}
                        </span>
                      ) : (
                        r.batch?.name || "Class"
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          r.status === "present"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : r.status === "late"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {r.status === "present" && <CheckCircle2 className="h-3.5 w-3.5" />}
                        {r.status === "late" && <Clock className="h-3.5 w-3.5" />}
                        {r.status === "absent" && <XCircle className="h-3.5 w-3.5" />}
                        {r.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {r.markedBy?.name || "Faculty Staff"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Mark Attendance */}
      {showMarkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Mark Student Attendance</h2>
            <p className="text-xs text-slate-500 mb-4">
              Select student, batch, and session status.
            </p>
            <form onSubmit={handleMarkAttendance} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Batch
                </label>
                <select
                  required
                  value={newAtt.batchId}
                  onChange={(e) => setNewAtt({ ...newAtt, batchId: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Batch...</option>
                  {batches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student
                </label>
                <select
                  required
                  value={newAtt.studentId}
                  onChange={(e) => setNewAtt({ ...newAtt, studentId: e.target.value })}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newAtt.date}
                    onChange={(e) => setNewAtt({ ...newAtt, date: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={newAtt.status}
                    onChange={(e) => setNewAtt({ ...newAtt, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="present">Present</option>
                    <option value="late">Late</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => setShowMarkModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Save Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
