import { useEffect, useState } from "react";
import api from "../api/axios";
import { logout } from "../utils/logout";
import StatusBadge from "../components/StatusBadge";

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/doctor/appointments");
      const data = Array.isArray(res.data) ? res.data : [res.data];
      setAppointments(data);
    } catch (err) {
      setError("Failed to load appointments. (Check token / API)");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    setError("");
    try {
      await api.put(`/appointments/${id}/status`, { status });
      // Update UI instantly (no need full refresh)
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Failed to update appointment status.";
      setError(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchAppointments();
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
            Doctor Dashboard
          </h2>
          <p style={{ color: "rgba(255, 255, 255, 0.7)", margin: 0 }}>
            View and approve/reject student appointments
          </p>
        </div>
        <button className="btn" onClick={logout}>
          Logout
        </button>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <button className="btn" onClick={fetchAppointments}>
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
          No appointments yet.
        </div>
      )}

      {!loading && appointments.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          {appointments.map((a) => {
            const isUpdating = updatingId === a.id;
            const canDecide = a.status === "pending";

            return (
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
                  <button
                    className="btn-approve"
                    disabled={!canDecide || isUpdating}
                    onClick={() => updateStatus(a.id, "approved")}
                  >
                    {isUpdating ? "Updating..." : "Approve"}
                  </button>

                  <button
                    className="btn-reject"
                    disabled={!canDecide || isUpdating}
                    onClick={() => updateStatus(a.id, "rejected")}
                  >
                    {isUpdating ? "Updating..." : "Reject"}
                  </button>

                  {!canDecide && (
                    <span
                      style={{
                        color: "rgba(255, 255, 255, 0.6)",
                        alignSelf: "center",
                      }}
                    >
                      Already decided
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
