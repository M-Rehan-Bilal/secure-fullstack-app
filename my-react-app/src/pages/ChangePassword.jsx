import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../useAuth";
import Message from "../components/Message";

export default function ChangePassword() {
  const navigate = useNavigate();
  const { clearUser } = useAuth();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState({ type: "error", text: "" });
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setMessage({ type: "error", text: "" });
    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    if (form.newPassword.length < 8) {
      setMessage({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }

    setLoading(true);
    const response = await api("/auth/password", {
      method: "PUT",
      body: {
        current_password: form.currentPassword,
        new_password: form.newPassword,
      },
    });
    setLoading(false);

    if (response.status === 200) {
      setMessage({ type: "success", text: response.json?.message || "Password changed" });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } else if (response.status === 401) {
      clearUser();
      navigate("/login");
    } else if (response.status === 400) {
      setMessage({
        type: "error",
        text: response.json?.error?.message || "Invalid password.",
        details: response.json?.error?.details,
      });
    } else {
      setMessage({
        type: "error",
        text: "Server error. Please try again later.",
      });
    }
  }

  return (
    <section>
      <h1>Change Password</h1>
      <form onSubmit={submit}>
        <label htmlFor="current-password">Current password</label>
        <input id="current-password" name="currentPassword" type="password" value={form.currentPassword} onChange={updateField} required />
        <label htmlFor="new-password">New password</label>
        <input id="new-password" name="newPassword" type="password" value={form.newPassword} onChange={updateField} required />
        <label htmlFor="confirm-new-password">Confirm new password</label>
        <input id="confirm-new-password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={updateField} required />
        <Message type={message.type} text={message.text} details={message.details} />
        <button type="submit" disabled={loading}>Change Password</button>
      </form>
    </section>
  );
}
