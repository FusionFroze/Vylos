import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { FiHome, FiSettings, FiGrid, FiMic, FiMenu } from "react-icons/fi";

export default function Layout() {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={`bg-white dark:bg-gray-800 shadow-md transition-all duration-300 
            ${open ? "w-64" : "w-20"} p-5`}
      >
        <button
          className="text-gray-700 dark:text-white mb-8"
          onClick={() => setOpen(!open)}
        >
          <FiMenu size={24} />
        </button>

        <div className="flex flex-col space-y-6">
          <SidebarLink to="/" icon={<FiHome />} label="Dashboard" open={open} />
          <SidebarLink
            to="/macros"
            icon={<FiGrid />}
            label="Macros"
            open={open}
          />
          <SidebarLink
            to="/settings"
            icon={<FiSettings />}
            label="Settings"
            open={open}
          />
          <SidebarLink
            to="/summarize"
            icon={<FiMic />}
            label="Summarize"
            open={open}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}

function SidebarLink({ to, icon, label, open }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 text-lg text-gray-700 dark:text-gray-200 
                 hover:text-blue-600 dark:hover:text-blue-400 transition"
    >
      {icon}
      {open && <span>{label}</span>}
    </Link>
  );
}
