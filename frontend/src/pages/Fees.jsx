import React, { useEffect, useState } from "react";
import { feeService, batchService, userService } from "../api";
import { mockFees, mockBatches, mockStudents } from "../api/mockData";
import { useAuth } from "../context/AuthContext";
import {
  CreditCard,
  Plus,
  Search,
  DollarSign,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  Receipt,
  FileText,
} from "lucide-react";

export default function Fees() {
  const { user, isDemoUser } = useAuth();
  const [fees, setFees] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [showCreateFeeModal, setShowCreateFeeModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);

  // Forms
  const [newFee, setNewFee] = useState({
    title: "",
    amount: "",
    dueDate: "",
    batchId: "",
    studentId: "",
  });
  const [payForm, setPayForm] = useState({
    amount: "",
    method: "cash",
    reference: "",
  });
  const [alert, setAlert] = useState({ type: "", msg: "" });

  const role = user?.role || "student";

  const loadFees = async () => {
    setLoading(true);
    if (isDemoUser) {
      setFees(mockFees);
      setBatches(mockBatches);
      setStudents(mockStudents);
      setLoading(false);
      return;
    }

    try {
      if (role === "student") {
        const res = await feeService.getMyFees();
        const list = res.data?.data?.fees || [];
        setFees(list.length > 0 ? list : mockFees);
      } else {
        const [feeRes, bRes, sRes] = await Promise.all([
          feeService.getAll(),
          batchService.getAll(),
          userService.getStudents().catch(() => ({ data: { data: { students: mockStudents } } })),
        ]);
        const list = feeRes.data?.data?.fees || [];
        setFees(list.length > 0 ? list : mockFees);
        setBatches(bRes.data?.data?.batches || mockBatches);
        setStudents(sRes.data?.data?.students || mockStudents);
      }
    } catch (err) {
      console.warn("API fallback to mock fees:", err);
      setFees(mockFees);
      setBatches(mockBatches);
      setStudents(mockStudents);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFees();
  }, [role, isDemoUser]);

  const handleCreateFee = async (e) => {
    e.preventDefault();
    setAlert({ type: "", msg: "" });

    try {
      if (!isDemoUser) {
        await feeService.create({
          ...newFee,
          amount: Number(newFee.amount),
        });
      }
      const studentObj = students.find((s) => s._id === newFee.studentId);
      const batchObj = batches.find((b) => b._id === newFee.batchId);
      const added = {
        _id: `f_${Date.now()}`,
        title: newFee.title,
        amount: Number(newFee.amount),
        paidAmount: 0,
        status: "pending",
        dueDate: new Date(newFee.dueDate).toISOString(),
        student: studentObj || { name: "Student", email: "" },
        batch: batchObj || { name: "Batch", code: "CODE" },
      };
      setFees([added, ...fees]);
      setShowCreateFeeModal(false);
      setNewFee({ title: "", amount: "", dueDate: "", batchId: "", studentId: "" });
      setAlert({ type: "success", msg: "Fee invoice created successfully!" });
    } catch (err) {
      setAlert({
        type: "error",
        msg:
          err.response?.data?.message ||
          "Failed to create fee. Ensure student is enrolled in batch.",
      });
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedFee) return;
    setAlert({ type: "", msg: "" });

    try {
      const payAmount = Number(payForm.amount);
      if (!isDemoUser) {
        await feeService.recordPayment(selectedFee._id, {
          amount: payAmount,
          method: payForm.method,
          reference: payForm.reference || undefined,
        });
      }

      setFees(
        fees.map((f) => {
          if (f._id === selectedFee._id) {
            const nextPaid = f.paidAmount + payAmount;
            return {
              ...f,
              paidAmount: nextPaid,
              status: nextPaid >= f.amount ? "paid" : "partial",
            };
          }
          return f;
        })
      );
      setShowPayModal(false);
      setPayForm({ amount: "", method: "cash", reference: "" });
      setAlert({ type: "success", msg: `Payment of $${payAmount} recorded successfully!` });
    } catch (err) {
      setAlert({
        type: "error",
        msg: err.response?.data?.message || "Failed to record payment.",
      });
    }
  };

  const filtered = fees.filter(
    (f) =>
      f.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.student?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {role === "student" ? "My Tuition Invoices & Fees" : "Fee & Tuition Management"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {role === "student"
              ? "Review billed items, outstanding dues, and receipt status."
              : "Generate invoices, log student payments, and audit collection ledger."}
          </p>
        </div>
        {role === "admin" && (
          <button
            onClick={() => setShowCreateFeeModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition"
          >
            <Plus className="h-4 w-4" />
            Issue New Fee
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
          placeholder="Filter fees by invoice title or student..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-slate-500">Loading fee records...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <CreditCard className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-600">No fee records found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Invoice Title</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Batch</th>
                  <th className="py-3 px-4">Amount Due</th>
                  <th className="py-3 px-4">Paid</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Due Date</th>
                  {role === "admin" && <th className="py-3 px-4 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((fee) => {
                  const outstanding = fee.amount - fee.paidAmount;
                  return (
                    <tr key={fee._id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
                          {fee.title}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {fee.student?.name || "Student"}
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-500">
                        {fee.batch?.code || "Standard"}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        ${fee.amount?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-emerald-600 font-semibold">
                        ${fee.paidAmount?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                            fee.status === "paid"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : fee.status === "partial"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {fee.status === "paid" ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          {fee.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {fee.dueDate
                          ? new Date(fee.dueDate).toLocaleDateString()
                          : "Immediate"}
                      </td>
                      {role === "admin" && (
                        <td className="py-3 px-4 text-right">
                          {outstanding > 0 ? (
                            <button
                              onClick={() => {
                                setSelectedFee(fee);
                                setPayForm({
                                  amount: outstanding,
                                  method: "cash",
                                  reference: "",
                                });
                                setShowPayModal(true);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                            >
                              <DollarSign className="h-3.5 w-3.5" />
                              Record Pay
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium italic">
                              Fully Settled
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create Fee */}
      {showCreateFeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Issue Tuition Fee</h2>
            <p className="text-xs text-slate-500 mb-4">
              Create an official fee entry for an enrolled batch student.
            </p>
            <form onSubmit={handleCreateFee} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Invoice Title
                </label>
                <input
                  type="text"
                  required
                  value={newFee.title}
                  onChange={(e) => setNewFee({ ...newFee, title: e.target.value })}
                  placeholder="e.g. Fall 2026 Semester Fee"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newFee.amount}
                    onChange={(e) => setNewFee({ ...newFee, amount: e.target.value })}
                    placeholder="2500"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newFee.dueDate}
                    onChange={(e) => setNewFee({ ...newFee, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Batch
                </label>
                <select
                  required
                  value={newFee.batchId}
                  onChange={(e) => setNewFee({ ...newFee, batchId: e.target.value })}
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
                  value={newFee.studentId}
                  onChange={(e) => setNewFee({ ...newFee, studentId: e.target.value })}
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
                  onClick={() => setShowCreateFeeModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Payment */}
      {showPayModal && selectedFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Record Payment</h2>
            <p className="text-xs text-slate-500 mb-4">
              Logging transaction for invoice: <strong>{selectedFee.title}</strong>
            </p>
            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount to Pay ($)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={selectedFee.amount - selectedFee.paidAmount}
                  value={payForm.amount}
                  onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={payForm.method}
                  onChange={(e) => setPayForm({ ...payForm, method: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="cash">Cash Counter</option>
                  <option value="upi">UPI / Instant Pay</option>
                  <option value="bank_transfer">Wire / Bank Transfer</option>
                  <option value="card">Credit / Debit Card</option>
                  <option value="other">Other / Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reference / Txn ID
                </label>
                <input
                  type="text"
                  value={payForm.reference}
                  onChange={(e) => setPayForm({ ...payForm, reference: e.target.value })}
                  placeholder="e.g. TXN-9988112"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
