import api from "../api/axios";

export async function logout() {
  try {
    await api.post("/logout");
  } catch (e) {
    // ignore API error
  }

  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/";
}
