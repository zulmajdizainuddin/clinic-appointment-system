import { useEffect, useState } from "react";
import api from "../api/axios";
import { logout } from "../utils/logout";
import { Link } from "react-router-dom";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div
      style={{
        padding: "40px 20px",
        maxWidth: "1200px",
        margin: "0 auto",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "32px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h2 style={{ margin: "0 0 8px 0", color: "#ffffff" }}>
            Admin - Users
          </h2>
          <p style={{ color: "rgba(255, 255, 255, 0.7)", margin: 0 }}>
            View all users in the system
          </p>
        </div>
        <button className="btn" onClick={logout}>
          Logout
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        <Link to="/admin">
          <button className="btn">Appointments</button>
        </Link>
        <Link to="/admin/users">
          <button className="btn">Users</button>
        </Link>
        <button className="btn" onClick={fetchUsers}>
          Refresh
        </button>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: "24px" }}>
          {error}
        </div>
      )}
      {loading && (
        <div className="loading">Loading users...</div>
      )}

      {!loading && users.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "rgba(255, 255, 255, 0.6)",
          }}
        >
          No users found.
        </div>
      )}

      {!loading && users.length > 0 && (
        <div
          style={{
            marginTop: "24px",
            background: "rgba(30, 41, 59, 0.4)",
            borderRadius: "12px",
            overflow: "hidden",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        background:
                          u.role === "admin"
                            ? "rgba(212, 175, 55, 0.2)"
                            : u.role === "doctor"
                            ? "rgba(59, 130, 246, 0.2)"
                            : "rgba(107, 114, 128, 0.2)",
                        color:
                          u.role === "admin"
                            ? "#d4af37"
                            : u.role === "doctor"
                            ? "#60a5fa"
                            : "#9ca3af",
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {u.created_at
                      ? new Date(u.created_at).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
