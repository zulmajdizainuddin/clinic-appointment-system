import { useEffect, useState } from "react";
import api from "../api/axios";
import { logout } from "../utils/logout";

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
    <div style={{ padding: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Student Dashboard</h2>
        <button onClick={logout}>Logout</button>
      </div>

      <h3 style={{ marginTop: 25 }}>Book Appointment</h3>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={bookAppointment} style={{ marginTop: 10 }}>
        <div style={{ marginBottom: 10 }}>
          <label>Doctor: </label>
          <select
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            style={{ marginLeft: 10 }}
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

        <div style={{ marginBottom: 10 }}>
          <label>Date: </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ marginLeft: 10 }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Time: </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={{ marginLeft: 10 }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Reason: </label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. headache"
            style={{ marginLeft: 10, width: 250 }}
          />
        </div>

        <button type="submit">Book (Pending)</button>
      </form>

      <hr style={{ margin: "30px 0" }} />

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3>My Appointments</h3>
        <button onClick={fetchMine}>Refresh</button>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && appointments.length === 0 && <p>No appointments yet.</p>}

      {!loading && appointments.length > 0 && (
        <div style={{ marginTop: 10 }}>
          {appointments.map((a) => (
            <div
              key={a.id}
              style={{
                border: "1px solid #444",
                padding: 12,
                marginBottom: 10,
                borderRadius: 8,
              }}
            >
              <p><b>ID:</b> {a.id}</p>
              <p>
                <b>Doctor:</b> {a.doctor?.name} ({a.doctor?.email})
              </p>
              <p><b>Date:</b> {a.appointment_date}</p>
              <p><b>Time:</b> {a.appointment_time}</p>
              <p><b>Reason:</b> {a.reason}</p>
              <p><b>Status:</b> {a.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
