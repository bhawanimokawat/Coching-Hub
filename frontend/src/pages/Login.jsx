import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Users,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const handleFormLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate("/dashboard");
      } else {
        setError(res.error || "Authentication failed.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = (role) => {
    loginAsDemo(role);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-xl shadow-indigo-500/30">
            <Building2 className="h-8 w-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-white">
          InstituteHub SaaS
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Sign in to manage your institute, classes, and student records
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Main Login Card */}
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-white/20">
          {error && (
            <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-sm font-medium text-rose-800">{error}</div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleFormLogin}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@institute.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-slate-50/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition shadow-md shadow-indigo-600/30 disabled:opacity-50"
            >
              {submitting ? "Signing In..." : "Sign In with Backend"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Account Selector Divider */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                1-Click Instant Demo Login:
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin("superAdmin")}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-purple-800 text-xs font-semibold transition"
              >
                <ShieldCheck className="h-4 w-4 text-purple-600" />
                Super Admin
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin("admin")}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-800 text-xs font-semibold transition"
              >
                <Building2 className="h-4 w-4 text-indigo-600" />
                Institute Admin
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin("teacher")}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition"
              >
                <Users className="h-4 w-4 text-emerald-600" />
                Faculty / Teacher
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin("student")}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-800 text-xs font-semibold transition"
              >
                <GraduationCap className="h-4 w-4 text-blue-600" />
                Student
              </button>
            </div>
            <p className="mt-2.5 text-center text-[11px] text-slate-500">
              Demo accounts auto-populate verified mock records for full Vercel preview testing!
            </p>
          </div>
        </div>

        {/* Public Register link */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-400">
            Need an account?{" "}
            <Link
              to="/register"
              className="font-medium text-indigo-400 hover:text-indigo-300 underline"
            >
              Register as Student
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
