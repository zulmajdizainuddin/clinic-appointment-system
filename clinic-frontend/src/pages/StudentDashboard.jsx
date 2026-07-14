import { useEffect, useState } from "react";
import api from "../api/axios";
import { logout } from "../utils/logout";
import StatusBadge from "../components/StatusBadge";

export default function StudentDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // booking form states
  const [doctorId, setDoctorId] = useState(2); // default doctor id (yours is 2)
  const [date, setDate] = useState("2026-01-10");
  const [time, setTime] = useState("10:30");
  const [reason, setReason] = useState("");

  const fetchMine = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/appointments/mine");
      const data = Array.isArray(res.data) ? res.data : [res.data];
      setAppointments(data);
    } catch (err) {
      setError("Failed to load your appointments.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await api.get("/doctors");
      setDoctors(res.data);
      // Auto select first doctor if none selected
      if (res.data.length > 0) setDoctorId(res.data[0].id);
    } catch (err) {
      setError("Failed to load doctors list.");
    }
  };
  useEffect(() => {
    fetchDoctors();
    fetchMine();
  }, []);

  const bookAppointment = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/appointments", {
        doctor_id: Number(doctorId),
        appointment_date: date,
        appointment_time: time,
        reason: reason || null,
      });

      setReason("");
      fetchMine(); // refresh list
      alert("Appointment booked (pending).");
    } catch (err) {
      // show Laravel validation message if exists
      const msg =
        err?.response?.data?.message ||
        "Failed to book appointment. Check doctor_id/date/time.";
      setError(msg);
    }
  };

  useEffect(() => {
    fetchMine();
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
          marginBottom: "40px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <h2 style={{ margin: 0, color: "#ffffff" }}>Student Dashboard</h2>
        <button className="btn" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="card" style={{ marginBottom: "40px" }}>
        <h3 style={{ margin: "0 0 24px 0", color: "#d4af37" }}>
          Book Appointment
        </h3>

        {error && (
          <div className="error-message" style={{ marginBottom: "24px" }}>
            {error}
          </div>
        )}

        <form onSubmit={bookAppointment}>
          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="doctor">Doctor</label>
            <select
              id="doctor"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
            >
              {doctors.length === 0 ? (
                <option value="">No doctors found</option>
              ) : (
                doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.email})
                  </option>
                ))
              )}
            </select>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="time">Time</label>
            <input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label htmlFor="reason">Reason</label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. headache, consultation"
              rows={3}
            />
          </div>

          <button type="submit" style={{ width: "100%" }}>
            Book Appointment
          </button>
        </form>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <h3 style={{ margin: 0, color: "#ffffff" }}>My Appointments</h3>
        <button className="btn" onClick={fetchMine}>
          Refresh
        </button>
      </div>

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
                <h3 style={{ margin: 0, color: "#d4af37" }}>
                  Appointment #{a.id}
                </h3>
                <StatusBadge status={a.status} />
              </div>

              <div
                style={{
                  display: "grid",
                  gap: "12px",
                }}
              >
                <p style={{ margin: 0 }}>
                  <b style={{ color: "#d4af37" }}>Doctor:</b>{" "}
                  <span style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                    {a.doctor?.name} ({a.doctor?.email})
                  </span>
                </p>
                <p style={{ margin: 0 }}>
                  <b style={{ color: "#d4af37" }}>Date:</b>{" "}
                  <span style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                    {a.appointment_date}
                  </span>
                </p>
                <p style={{ margin: 0 }}>
                  <b style={{ color: "#d4af37" }}>Time:</b>{" "}
                  <span style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                    {a.appointment_time}
                  </span>
                </p>
                <p style={{ margin: 0 }}>
                  <b style={{ color: "#d4af37" }}>Reason:</b>{" "}
                  <span style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                    {a.reason || "-"}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
