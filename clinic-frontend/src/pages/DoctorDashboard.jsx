import { useEffect, useState } from "react";
import api from "../api/axios";
import { logout } from "../utils/logout";

function StatusBadge({ status }) {
  const style = {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    border: "1px solid #444",
    marginLeft: 8,
  };

  let label = status || "unknown";
  if (label === "pending") style.background = "#2b2b2b";
  if (label === "approved") style.background = "#123b1f";
  if (label === "rejected") style.background = "#3b1212";

  return <span style={style}>{label.toUpperCase()}</span>;
}

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
    <div style={{ padding: 40, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ margin: 0 }}>Doctor Dashboard</h2>
          <p style={{ opacity: 0.8, marginTop: 6 }}>
            View and approve/reject student appointments.
          </p>
        </div>
        <button onClick={logout} style={{ height: 40 }}>
          Logout
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <button onClick={fetchAppointments}>Refresh</button>
      </div>

      {error && (
        <p style={{ color: "salmon", marginTop: 12 }}>
          {error}
        </p>
      )}

      {loading && <p style={{ marginTop: 18 }}>Loading...</p>}

      {!loading && appointments.length === 0 && (
        <p style={{ marginTop: 18 }}>No appointments yet.</p>
      )}

      {!loading && appointments.length > 0 && (
        <div style={{ marginTop: 18 }}>
          {appointments.map((a) => {
            const isUpdating = updatingId === a.id;
            const canDecide = a.status === "pending";

            return (
              <div
                key={a.id}
                style={{
                  border: "1px solid #444",
                  padding: 16,
                  marginBottom: 12,
                  borderRadius: 12,
                  background: "#1b1b1b",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <b>Appointment #{a.id}</b>
                    <StatusBadge status={a.status} />
                  </div>
                  <div style={{ opacity: 0.8 }}>
                    {a.appointment_date} • {a.appointment_time}
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <p style={{ margin: "6px 0" }}>
                    <b>Student:</b> {a.student?.name} ({a.student?.email})
                  </p>
                  <p style={{ margin: "6px 0" }}>
                    <b>Reason:</b> {a.reason || "-"}
                  </p>
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
                  <button
                    disabled={!canDecide || isUpdating}
                    onClick={() => updateStatus(a.id, "approved")}
                  >
                    {isUpdating ? "Updating..." : "Approve"}
                  </button>

                  <button
                    disabled={!canDecide || isUpdating}
                    onClick={() => updateStatus(a.id, "rejected")}
                  >
                    {isUpdating ? "Updating..." : "Reject"}
                  </button>

                  {!canDecide && (
                    <span style={{ opacity: 0.7, alignSelf: "center" }}>
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
