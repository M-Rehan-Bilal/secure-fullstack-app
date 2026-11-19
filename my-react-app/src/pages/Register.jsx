import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import Message from "../components/Message";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "", confirmPassword: "" });
  const [message, setMessage] = useState({ type: "error", text: "" });
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setMessage({ type: "error", text: "" });

    if (form.password !== form.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    if (form.password.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }

    setLoading(true);
    const response = await api("/auth/register", {
      method: "POST",
      body: { username: form.username, password: form.password },
    });
    setLoading(false);

    if (response.status === 201) {
      navigate("/login", { state: { message: "Account created" } });
    } else if (response.status === 400) {
      setMessage({
        type: "error",
        text: response.json?.error?.message || "Invalid registration.",
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
      <h1>Register</h1>
      <form onSubmit={submit}>
        <label htmlFor="register-username">Username</label>
        <input id="register-username" name="username" value={form.username} onChange={updateField} required />
        <label htmlFor="register-password">Password</label>
        <input id="register-password" name="password" type="password" value={form.password} onChange={updateField} required />
        <label htmlFor="confirm-password">Confirm password</label>
        <input id="confirm-password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={updateField} required />
        <Message type={message.type} text={message.text} details={message.details} />
        <button type="submit" disabled={loading}>Register</button>
      </form>
    </section>
  );
}
