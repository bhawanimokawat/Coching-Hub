import React, { useEffect, useState } from "react";
import { instituteService, userService } from "../api";
import { mockInstitutes } from "../api/mockData";
import { useAuth } from "../context/AuthContext";
import {
  Building2,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  MapPin,
  UserPlus,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function Institutes() {
  const { isDemoUser } = useAuth();
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedInstitute, setSelectedInstitute] = useState(null);

  // Form states
  const [newInst, setNewInst] = useState({ name: "", code: "", email: "", phone: "", address: "" });
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", password: "" });
  const [actionMsg, setActionMsg] = useState({ type: "", text: "" });

  const loadInstitutes = async () => {
    setLoading(true);
    if (isDemoUser) {
      setInstitutes(mockInstitutes);
      setLoading(false);
      return;
    }

    try {
      const res = await instituteService.getAll();
      const list = res.data?.data?.institutes || [];
      setInstitutes(list.length > 0 ? list : mockInstitutes);
    } catch (err) {
      console.warn("Backend error, falling back to mock institutes:", err);
      setInstitutes(mockInstitutes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstitutes();
  }, [isDemoUser]);

  const handleCreateInstitute = async (e) => {
    e.preventDefault();
    setActionMsg({ type: "", text: "" });

    try {
      if (!isDemoUser) {
        await instituteService.create(newInst);
      }
      const created = {
        _id: `inst_${Date.now()}`,
        ...newInst,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      setInstitutes([created, ...institutes]);
      setShowCreateModal(false);
      setNewInst({ name: "", code: "", email: "", phone: "", address: "" });
      setActionMsg({ type: "success", text: "New tenant institute onboarded successfully!" });
    } catch (err) {
      setActionMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to create institute.",
      });
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!selectedInstitute) return;
    setActionMsg({ type: "", text: "" });

    try {
      if (!isDemoUser) {
        await userService.createInstituteAdmin({
          ...newAdmin,
          instituteId: selectedInstitute._id,
        });
      }
      setShowAdminModal(false);
      setNewAdmin({ name: "", email: "", password: "" });
      setActionMsg({
        type: "success",
        text: `Admin account granted for ${selectedInstitute.name}!`,
      });
    } catch (err) {
      setActionMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to create admin.",
      });
    }
  };

  const filtered = institutes.filter(
    (i) =>
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Tenant Institutes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Provision, inspect, and assign root admins to educational organizations.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition"
        >
          <Plus className="h-4 w-4" />
          Add Institute
        </button>
      </div>

      {actionMsg.text && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2.5 ${
            actionMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {actionMsg.type === "success" ? (
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600" />
          )}
          {actionMsg.text}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by institute name, code, or email..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        />
      </div>

      {/* Institutes Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-sm text-slate-500">Loading institutes...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <Building2 className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-600">No institutes found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((inst) => (
            <div
              key={inst._id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {inst.code}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-2">{inst.name}</h3>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      inst.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        inst.isActive ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                    />
                    {inst.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mt-4 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{inst.email || "No email"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{inst.phone || "No phone"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{inst.address || "No address provided"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedInstitute(inst);
                    setShowAdminModal(true);
                  }}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-semibold transition"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Assign Admin
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Institute */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Create New Institute</h2>
            <p className="text-xs text-slate-500 mb-4">
              Register a tenant domain and operational details.
            </p>
            <form onSubmit={handleCreateInstitute} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Institute Name
                </label>
                <input
                  type="text"
                  required
                  value={newInst.name}
                  onChange={(e) => setNewInst({ ...newInst, name: e.target.value })}
                  placeholder="e.g. Stanford Academy of Science"
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
                    value={newInst.code}
                    onChange={(e) => setNewInst({ ...newInst, code: e.target.value })}
                    placeholder="e.g. STN-01"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={newInst.phone}
                    onChange={(e) => setNewInst({ ...newInst, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Email
                </label>
                <input
                  type="email"
                  required
                  value={newInst.email}
                  onChange={(e) => setNewInst({ ...newInst, email: e.target.value })}
                  placeholder="contact@institute.edu"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Campus Address
                </label>
                <input
                  type="text"
                  value={newInst.address}
                  onChange={(e) => setNewInst({ ...newInst, address: e.target.value })}
                  placeholder="Street, City, State"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
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
                  Create Institute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assign Institute Admin */}
      {showAdminModal && selectedInstitute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Assign Admin for {selectedInstitute.name}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Creates a master administrator user authorized for this institute tenant.
            </p>
            <form onSubmit={handleCreateAdmin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Admin Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  placeholder="e.g. Dr. Arthur Conan"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  placeholder="admin@institute.edu"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password (min 12 characters)
                </label>
                <input
                  type="password"
                  required
                  minLength={12}
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Assign Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
