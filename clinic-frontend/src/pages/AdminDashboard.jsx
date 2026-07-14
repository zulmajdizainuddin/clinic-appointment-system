import { useEffect, useState } from "react";
import api from "../api/axios";
import { logout } from "../utils/logout";
import { Link } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [assigningId, setAssigningId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const fetchAllAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/appointments");
      setAppointments(res.data);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to load admin appointments."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await api.get("/doctors");
      setDoctors(res.data);
    } catch (err) {
      console.error("Failed to load doctors");
    }
  };

  // ✅ Assign doctor (already working)
  const assignDoctor = async (appointmentId, doctorId) => {
    setAssigningId(appointmentId);
    try {
      const res = await api.put(
        `/admin/appointments/${appointmentId}/assign-doctor`,
        { doctor_id: Number(doctorId) }
      );

      // Update UI immediately
      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? res.data : a))
      );
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to assign doctor");
    } finally {
      setAssigningId(null);
    }
  };

  // ✅ NEW: Admin update appointment status
  const updateStatus = async (appointmentId, status) => {
    setUpdatingStatusId(appointmentId);
    try {
      const res = await api.put(`/admin/appointments/${appointmentId}/status`, {
        status,
      });

      // Update UI immediately
      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? res.data : a))
      );
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  useEffect(() => {
    fetchAllAppointments();
    fetchDoctors();
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
            Admin Dashboard
          </h2>
          <p style={{ color: "rgba(255, 255, 255, 0.7)", margin: 0 }}>
            View all appointments in the system
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
        <button className="btn" onClick={fetchAllAppointments}>
          Refresh
        </button>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: "24px" }}>
          {error}
        </div>
      )}
      {loading && (
        <div className="loading">Loading appointments...</div>
      )}

      {!loading && appointments.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "rgba(255, 255, 255, 0.6)",
          }}
        >
          No appointments found.
        </div>
      )}

      {!loading && appointments.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          {appointments.map((a) => (
            <div key={a.id} className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "16px",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <h3 style={{ margin: "0 0 8px 0", color: "#d4af37" }}>
                    Appointment #{a.id}
                  </h3>
                  <p style={{ margin: 0, color: "rgba(255, 255, 255, 0.7)" }}>
                    {a.appointment_date} • {a.appointment_time}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <button
                  className="btn-approve"
                  onClick={() => updateStatus(a.id, "approved")}
                  disabled={updatingStatusId === a.id}
                >
                  Approve
                </button>

                <button
                  className="btn-reject"
                  onClick={() => updateStatus(a.id, "rejected")}
                  disabled={updatingStatusId === a.id}
                >
                  Reject
                </button>

                <button
                  className="btn-ghost"
                  onClick={() => updateStatus(a.id, "pending")}
                  disabled={updatingStatusId === a.id}
                >
                  Reset
                </button>

                {updatingStatusId === a.id && (
                  <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                    Updating...
                  </span>
                )}
              </div>

              <div
                style={{
                  display: "grid",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <p style={{ margin: 0 }}>
                  <b style={{ color: "#d4af37" }}>Student:</b>{" "}
                  <span style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                    {a.student?.name} ({a.student?.email})
                  </span>
                </p>

                <p style={{ margin: 0 }}>
                  <b style={{ color: "#d4af37" }}>Doctor:</b>{" "}
                  <span style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                    {a.doctor
                      ? `${a.doctor.name} (${a.doctor.email})`
                      : "Not assigned"}
                  </span>
                </p>

                <p style={{ margin: 0 }}>
                  <b style={{ color: "#d4af37" }}>Reason:</b>{" "}
                  <span style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                    {a.reason || "-"}
                  </span>
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <select
                  value={a.doctor?.id || ""}
                  onChange={(e) => {
                    if (!e.target.value) return;
                    assignDoctor(a.id, e.target.value);
                  }}
                  disabled={assigningId === a.id}
                  style={{ flex: "1", minWidth: "200px" }}
                >
                  <option value="">-- Assign doctor --</option>
                  {a.doctor && !doctors.some((d) => d.id === a.doctor.id) && (
                    <option value={a.doctor.id}>
                      {a.doctor.name} ({a.doctor.email})
                    </option>
                  )}
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.email})
                    </option>
                  ))}
                </select>

                {assigningId === a.id && (
                  <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                    Assigning...
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
