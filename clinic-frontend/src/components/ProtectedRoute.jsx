import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ allowRole, children }) {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  // Not logged in
  if (!token || !user) return <Navigate to="/login" replace />;

  // Role not allowed
  if (allowRole && user.role !== allowRole) {
    // redirect user to their correct dashboard
    if (user.role === "doctor") return <Navigate to="/doctor" replace />;
    if (user.role === "student") return <Navigate to="/student" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}
