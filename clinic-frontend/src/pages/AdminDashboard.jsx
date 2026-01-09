import { useEffect, useState } from "react";
import api from "../api/axios";
import { logout } from "../utils/logout";
import { Link } from "react-router-dom";

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
    <div style={{ padding: 40, maxWidth: 950, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
          <p style={{ opacity: 0.8, marginTop: 6 }}>
            View all appointments in the system.
          </p>
        </div>

        <button className="btn" onClick={logout}>
          Logout
        </button>
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
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

      {error && <p style={{ color: "salmon" }}>{error}</p>}
      {loading && <p>Loading...</p>}

      {!loading && appointments.length === 0 && <p>No appointments found.</p>}

      {!loading && appointments.length > 0 && (
        <div style={{ marginTop: 18 }}>
          {appointments.map((a) => (
            <div key={a.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <b>Appointment #{a.id}</b>
                <span style={{ opacity: 0.8 }}>
                  {a.appointment_date} • {a.appointment_time}
                </span>
              </div>

              {/* ✅ Status badge */}
              <p style={{ margin: "8px 0" }}>
                <b>Status:</b>{" "}
                <span className={`badge ${a.status}`}>
                  {String(a.status || "").toUpperCase()}
                </span>
              </p>

              {/* ✅ NEW: Approve / Reject / Reset */}
              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <button
                  className="btn"
                  onClick={() => updateStatus(a.id, "approved")}
                  disabled={updatingStatusId === a.id}
                >
                  Approve
                </button>

                <button
                  className="btn"
                  onClick={() => updateStatus(a.id, "rejected")}
                  disabled={updatingStatusId === a.id}
                >
                  Reject
                </button>

                <button
                  className="btn"
                  onClick={() => updateStatus(a.id, "pending")}
                  disabled={updatingStatusId === a.id}
                >
                  Reset
                </button>

                {updatingStatusId === a.id && (
                  <span style={{ opacity: 0.8 }}>Updating...</span>
                )}
              </div>

              <p style={{ margin: "6px 0" }}>
                <b>Student:</b> {a.student?.name} ({a.student?.email})
              </p>

              <p style={{ margin: "6px 0" }}>
                <b>Doctor:</b>{" "}
                {a.doctor
                  ? `${a.doctor.name} (${a.doctor.email})`
                  : "Not assigned"}
              </p>

              {/* ✅ Assign doctor dropdown */}
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <select
                  value={a.doctor?.id || ""}
                  onChange={(e) => assignDoctor(a.id, e.target.value)}
                  disabled={assigningId === a.id}
                >
                  <option value="">-- Assign doctor --</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.email})
                    </option>
                  ))}
                </select>

                {assigningId === a.id && <span>Assigning...</span>}
              </div>

              <p style={{ margin: "6px 0" }}>
                <b>Reason:</b> {a.reason || "-"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
