import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  CalendarCheck,
  CreditCard,
  LogOut,
  Menu,
  X,
  BookOpen,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, isDemoUser } = useAuth();
  const location = useLocation();

  const role = user?.role || "student";

  // Navigation items customized per role
  const getNavLinks = () => {
    switch (role) {
      case "superAdmin":
        return [
          { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
          { name: "Institutes", path: "/institutes", icon: Building2 },
          { name: "All Users", path: "/users", icon: Users },
        ];
      case "admin":
        return [
          { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
          { name: "Students", path: "/students", icon: GraduationCap },
          { name: "Teachers", path: "/teachers", icon: Users },
          { name: "Batches", path: "/batches", icon: BookOpen },
          { name: "Attendance", path: "/attendance", icon: CalendarCheck },
          { name: "Fee Management", path: "/fees", icon: CreditCard },
        ];
      case "teacher":
        return [
          { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
          { name: "My Batches", path: "/batches", icon: BookOpen },
          { name: "Mark Attendance", path: "/attendance", icon: CalendarCheck },
        ];
      case "student":
      default:
        return [
          { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
          { name: "My Classes & Batches", path: "/batches", icon: BookOpen },
          { name: "My Attendance", path: "/attendance", icon: CalendarCheck },
          { name: "Fee Invoices", path: "/fees", icon: CreditCard },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header / Brand */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                InstituteHub
              </span>
              <span className="text-[11px] font-medium text-slate-500 tracking-wide uppercase">
                {role === "superAdmin"
                  ? "Super Admin Portal"
                  : role === "admin"
                  ? "Admin Console"
                  : role === "teacher"
                  ? "Faculty Portal"
                  : "Student Portal"}
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Demo Mode Badge */}
        {isDemoUser && (
          <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center gap-2 text-xs font-semibold text-amber-800">
            <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Interactive Demo Mode Active</span>
          </div>
        )}

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-600 uppercase">
            Menu
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`h-4.5 w-4.5 ${
                    isActive ? "text-white" : "text-slate-400"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
              {user?.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-slate-600 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
