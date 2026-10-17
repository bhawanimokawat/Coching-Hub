import React, { useState } from "react";
import Sidebar from "../components/common/Sidebar";
import Navbar from "../components/common/Navbar";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Sidebar for desktop & drawer for mobile */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Body Content area */}
      <div className="flex flex-col min-h-screen lg:pl-72 transition-all duration-300">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} InstituteHub SaaS. Multi-tenant Cloud Platform.</p>
        </footer>
      </div>
    </div>
  );
}
