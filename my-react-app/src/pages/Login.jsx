import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../useAuth";
import Message from "../components/Message";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState({
    type: "success",
    text: location.state?.message || "",
  });
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setMessage({ type: "error", text: "" });
    setLoading(true);
    const response = await api("/auth/login", { method: "POST", body: form });
    setLoading(false);

    if (response.status === 200) {
      const loggedIn = await refreshUser();
      if (loggedIn) navigate("/records");
      else setMessage({ type: "error", text: "Unable to load the logged-in user." });
    } else if (response.status === 401) {
      setMessage({ type: "error", text: "Invalid username or password" });
    } else if (response.status === 429) {
      setMessage({
        type: "error",
        text: "Too many login attempts. Please wait a minute and try again.",
      });
    } else if (response.status === 400) {
      setMessage({
        type: "error",
        text: response.json?.error?.message || "Invalid login.",
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
      <h1>Login</h1>
      <form onSubmit={submit}>
        <label htmlFor="login-username">Username</label>
        <input id="login-username" name="username" value={form.username} onChange={updateField} required />
        <label htmlFor="login-password">Password</label>
        <input id="login-password" name="password" type="password" value={form.password} onChange={updateField} required />
        <Message type={message.type} text={message.text} details={message.details} />
        <button type="submit" disabled={loading}>Login</button>
      </form>
    </section>
  );
}
