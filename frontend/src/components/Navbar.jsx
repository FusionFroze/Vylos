import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    nav("/login");
  };

  // if (!user) return null; // Hide navbar on login/register pages

  return (
    <nav className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between shadow-lg">
      {/* Logo */}
      <Link to="/" className="text-2xl font-bold tracking-wide">
        Vylos <span className="text-blue-400">AI</span>
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-6 items-center text-lg">
        <Link className="hover:text-blue-400" to="/">
          Dashboard
        </Link>
        <Link className="hover:text-blue-400" to="/settings">
          Settings
        </Link>
        <Link className="hover:text-blue-400" to="/macros">
          Macros
        </Link>
        <Link to="/browser">Browser</Link>

        <button
          className="bg-red-600 px-4 py-1 rounded hover:bg-red-700"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {/* Mobile Hamburger */}
      <button className="md:hidden text-3xl" onClick={() => setOpen(!open)}>
        ☰
      </button>

      {/* Mobile Menu Drawer */}
      {open && (
        <div className="absolute top-16 left-0 w-full bg-gray-800 flex flex-col p-4 gap-4 text-lg md:hidden shadow-lg border-t border-gray-700">
          <Link
            onClick={() => setOpen(false)}
            className="hover:text-blue-400"
            to="/"
          >
            Dashboard
          </Link>
          <Link
            onClick={() => setOpen(false)}
            className="hover:text-blue-400"
            to="/settings"
          >
            Settings
          </Link>
          <Link
            onClick={() => setOpen(false)}
            className="hover:text-blue-400"
            to="/macros"
          >
            Macros
          </Link>
          <Link className="hover:text-blue-400" to="/summarize">
            Summarize
          </Link>
          <Link to="/browser">Browser</Link>

          <button
            className="bg-red-600 px-4 py-1 rounded hover:bg-red-700"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
