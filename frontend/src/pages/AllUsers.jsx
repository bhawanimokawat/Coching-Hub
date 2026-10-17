import React, { useEffect, useState } from "react";
import { userService } from "../api";
import { mockUsers } from "../api/mockData";
import { useAuth } from "../context/AuthContext";
import { Users, Search, ShieldCheck, Mail, Building, CheckCircle2, XCircle } from "lucide-react";

export default function AllUsers() {
  const { isDemoUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (isDemoUser) {
        setUsers(mockUsers);
        setLoading(false);
        return;
      }

      try {
        const res = await userService.getAllUsers();
        const list = res.data?.data?.users || [];
        setUsers(list.length > 0 ? list : mockUsers);
      } catch (err) {
        console.warn("API fallback to mock users:", err);
        setUsers(mockUsers);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isDemoUser]);

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Directory</h1>
        <p className="text-sm text-slate-500 mt-1">
          Global directory of all provisioned accounts across tenant institutes.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by user name or email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 uppercase">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Institute Admins</option>
            <option value="teacher">Teachers</option>
            <option value="student">Students</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-slate-500">Loading directory...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Tenant Institute</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-xs">
                          {u.name[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{u.name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          u.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : u.role === "teacher"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {u.institute?.name ? (
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Building className="h-3.5 w-3.5 text-slate-400" />
                          <span>{u.institute.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium ${
                          u.isActive !== false ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {u.isActive !== false ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" />
                        )}
                        {u.isActive !== false ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Recent"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
