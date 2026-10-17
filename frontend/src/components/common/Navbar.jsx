import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Menu, Bell, Search, Sparkles, Building2, UserCircle } from "lucide-react";

export default function Navbar({ onMenuClick }) {
  const { user, isDemoUser, loginAsDemo } = useAuth();

  const roleBadgeColors = {
    superAdmin: "bg-purple-100 text-purple-700 border-purple-200",
    admin: "bg-indigo-100 text-indigo-700 border-indigo-200",
    teacher: "bg-emerald-100 text-emerald-700 border-emerald-200",
    student: "bg-blue-100 text-blue-700 border-blue-200",
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
      {/* Left side: Mobile Toggle & Page Context */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden focus:outline-none"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:block">
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Workspace
          </div>
          <div className="text-sm font-bold text-slate-800">
            {user?.instituteName || "Apex Academy & Multi-tenant Hub"}
          </div>
        </div>
      </div>

      {/* Right side: Quick Role Switcher (in demo/dev mode), Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Role Switcher Pill */}
        <div className="flex items-center gap-2">
          <span className="hidden md:inline text-xs font-medium text-slate-600">
            Switch Demo Role:
          </span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => loginAsDemo("superAdmin")}
              className={`px-2 py-1 text-xs rounded-lg font-medium transition-all ${
                user?.role === "superAdmin"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              SuperAdmin
            </button>
            <button
              onClick={() => loginAsDemo("admin")}
              className={`px-2 py-1 text-xs rounded-lg font-medium transition-all ${
                user?.role === "admin"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => loginAsDemo("teacher")}
              className={`px-2 py-1 text-xs rounded-lg font-medium transition-all ${
                user?.role === "teacher"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Teacher
            </button>
            <button
              onClick={() => loginAsDemo("student")}
              className={`px-2 py-1 text-xs rounded-lg font-medium transition-all ${
                user?.role === "student"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Student
            </button>
          </div>
        </div>

        {/* User Role Tag */}
        <span
          className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
            roleBadgeColors[user?.role] || "bg-slate-100 text-slate-700 border-slate-200"
          }`}
        >
          {user?.role}
        </span>
      </div>
    </header>
  );
}
