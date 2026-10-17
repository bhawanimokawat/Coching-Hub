import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../api";
import { Building2, Lock, Mail, User, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authService.register({ name, email, password });
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Please make sure password is 8+ characters."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-xl shadow-indigo-500/30">
            <Building2 className="h-8 w-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-white">
          Create Student Account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Join your institute's digital campus
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-white/20">
          {error && (
            <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-sm font-medium text-rose-800">{error}</div>
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-sm font-medium text-emerald-800">
                Registration successful! Redirecting to login...
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleRegister}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aiden Sharma"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-slate-50/50"
                />
              </div>
            </div>

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
                  placeholder="student@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password (min 8 characters)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-slate-50/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition shadow-md shadow-indigo-600/30 disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 text-center border-t border-slate-200 pt-4">
            <p className="text-xs text-slate-600">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
