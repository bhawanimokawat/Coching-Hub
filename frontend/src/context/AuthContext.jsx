import React, { createContext, useContext, useState, useEffect } from "react";
import { authService, userService } from "../api";

const AuthContext = createContext(null);

export const DEMO_ACCOUNTS = {
  superAdmin: {
    name: "Dr. Alexander Wright",
    email: "superadmin@institutehub.com",
    role: "superAdmin",
    institute: null,
    token: "mock-superadmin-token-institutehub",
  },
  admin: {
    name: "Principal Sarah Jenkins",
    email: "admin@apexacademy.edu",
    role: "admin",
    institute: "inst_apex_01",
    instituteName: "Apex Science & Tech Academy",
    token: "mock-admin-token-institutehub",
  },
  teacher: {
    name: "Prof. Michael Chang",
    email: "mchang@apexacademy.edu",
    role: "teacher",
    institute: "inst_apex_01",
    instituteName: "Apex Science & Tech Academy",
    token: "mock-teacher-token-institutehub",
  },
  student: {
    name: "Aiden Sharma",
    email: "aiden.sharma@apexacademy.edu",
    role: "student",
    institute: "inst_apex_01",
    instituteName: "Apex Science & Tech Academy",
    token: "mock-student-token-institutehub",
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("institutehub_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("institutehub_token") || null;
  });

  const [loading, setLoading] = useState(false);
  const [isDemoUser, setIsDemoUser] = useState(() => {
    return localStorage.getItem("institutehub_is_demo") === "true";
  });

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener("auth-unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth-unauthorized", handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      const result = response.data?.data || response.data;
      const nextToken = result.token;
      const nextUser = result.user;

      if (!nextToken || !nextUser) {
        throw new Error("Invalid login response format from server.");
      }

      localStorage.setItem("institutehub_token", nextToken);
      localStorage.setItem("institutehub_user", JSON.stringify(nextUser));
      localStorage.removeItem("institutehub_is_demo");

      setToken(nextToken);
      setUser(nextUser);
      setIsDemoUser(false);

      return { success: true, user: nextUser };
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Login failed. Check credentials.";
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = (role) => {
    const demoProfile = DEMO_ACCOUNTS[role];
    if (!demoProfile) return;

    localStorage.setItem("institutehub_token", demoProfile.token);
    localStorage.setItem("institutehub_user", JSON.stringify(demoProfile));
    localStorage.setItem("institutehub_is_demo", "true");

    setToken(demoProfile.token);
    setUser(demoProfile);
    setIsDemoUser(true);

    return demoProfile;
  };

  const logout = async () => {
    try {
      if (token && !isDemoUser) {
        await authService.logout().catch(() => {});
      }
    } finally {
      localStorage.removeItem("institutehub_token");
      localStorage.removeItem("institutehub_user");
      localStorage.removeItem("institutehub_is_demo");
      setToken(null);
      setUser(null);
      setIsDemoUser(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isDemoUser,
        login,
        loginAsDemo,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}
