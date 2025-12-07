import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

export default function ProtectedRoute({ children }) {
  const [verified, setVerified] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return setVerified(false);

    axios
      .get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => setVerified(true))
      .catch(() => {
        localStorage.removeItem("token");
        setVerified(false);
      });
  }, []);

  if (verified === null)
    return <div className="p-6 text-center">Loading...</div>;

  return verified ? children : <Navigate to="/login" />;
}
