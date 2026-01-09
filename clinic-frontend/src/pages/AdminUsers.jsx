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
    <div style={{ padding: 40, maxWidth: 950, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ margin: 0 }}>Admin - Users</h2>
          <p style={{ opacity: 0.8, marginTop: 6 }}>
            View all users in the system.
          </p>
        </div>
        <button onClick={logout} style={{ height: 40 }}>
          Logout
        </button>
      </div>

      {/* Simple nav */}
      <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
        <Link to="/admin">
          <button>Appointments</button>
        </Link>
        <Link to="/admin/users">
          <button>Users</button>
        </Link>
        <button onClick={fetchUsers}>Refresh</button>
      </div>

      {error && <p style={{ color: "salmon", marginTop: 12 }}>{error}</p>}
      {loading && <p style={{ marginTop: 18 }}>Loading...</p>}

      {!loading && users.length === 0 && <p style={{ marginTop: 18 }}>No users found.</p>}

      {!loading && users.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #444", padding: 10 }}>ID</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #444", padding: 10 }}>Name</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #444", padding: 10 }}>Email</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #444", padding: 10 }}>Role</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #444", padding: 10 }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ borderBottom: "1px solid #333", padding: 10 }}>{u.id}</td>
                  <td style={{ borderBottom: "1px solid #333", padding: 10 }}>{u.name}</td>
                  <td style={{ borderBottom: "1px solid #333", padding: 10 }}>{u.email}</td>
                  <td style={{ borderBottom: "1px solid #333", padding: 10 }}>{u.role}</td>
                  <td style={{ borderBottom: "1px solid #333", padding: 10 }}>
                    {u.created_at ? new Date(u.created_at).toLocaleString() : "-"}
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
