import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../useAuth";
import Message from "../components/Message";

export default function Records() {
  const navigate = useNavigate();
  const { user, clearUser } = useAuth();
  const [form, setForm] = useState({
    full_name: "",
    roll_no: "",
    phone: "",
    department: "",
  });
  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState({ type: "error", text: "" });
  const [loading, setLoading] = useState(false);

  async function loadRecords() {
    const response = await api("/records");
    if (response.status === 200) {
      setRecords(response.json?.data || []);
    } else if (response.status === 401) {
      clearUser();
      navigate("/login");
    } else {
      setMessage({ type: "error", text: "Server error. Please try again later." });
    }
  }

  useEffect(() => {
    let active = true;
    api("/records").then((response) => {
      if (!active) return;
      if (response.status === 200) {
        setRecords(response.json?.data || []);
      } else if (response.status === 401) {
        clearUser();
        navigate("/login");
      } else {
        setMessage({ type: "error", text: "Server error. Please try again later." });
      }
    });

    return () => {
      active = false;
    };
  }, [clearUser, navigate]);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setMessage({ type: "error", text: "" });
    setLoading(true);
    const response = await api("/records", { method: "POST", body: form });
    setLoading(false);

    if (response.status === 201) {
      setForm({ full_name: "", roll_no: "", phone: "", department: "" });
      setMessage({ type: "success", text: response.json?.message || "Record created" });
      await loadRecords();
    } else if (response.status === 401) {
      clearUser();
      navigate("/login");
    } else if (response.status === 400) {
      setMessage({
        type: "error",
        text: response.json?.error?.message || "Invalid record.",
        details: response.json?.error?.details,
      });
    } else {
      setMessage({
        type: "error",
        text: "Server error. Please try again later.",
      });
    }
  }

  async function deleteRecord(id) {
    setMessage({ type: "error", text: "" });
    const response = await api(`/records/${id}`, { method: "DELETE" });

    if (response.status === 200) {
      setMessage({ type: "success", text: "Record deleted" });
      await loadRecords();
    } else if (response.status === 401) {
      clearUser();
      navigate("/login");
    } else if (response.status === 403) {
      setMessage({ type: "error", text: "Not allowed" });
    } else if (response.status === 404) {
      setMessage({ type: "error", text: "Not found" });
    } else {
      setMessage({ type: "error", text: "Server error. Please try again later." });
    }
  }

  return (
    <section>
      <h1>Student Registration</h1>
      <form onSubmit={submit}>
        <label htmlFor="full-name">Full name</label>
        <input id="full-name" name="full_name" value={form.full_name} onChange={updateField} required />
        <label htmlFor="roll-no">Roll no</label>
        <input id="roll-no" name="roll_no" value={form.roll_no} onChange={updateField} required />
        <label htmlFor="phone">Phone</label>
        <input id="phone" name="phone" value={form.phone} onChange={updateField} required />
        <label htmlFor="department">Department</label>
        <input id="department" name="department" value={form.department} onChange={updateField} required />
        <Message type={message.type} text={message.text} details={message.details} />
        <button type="submit" disabled={loading}>Add Record</button>
      </form>

      <h2>Stored Records</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Roll No</th>
            <th>Phone</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td>{record.full_name}</td>
              <td>{record.roll_no}</td>
              <td>{record.phone}</td>
              <td>{record.department}</td>
              <td>
                {user?.role === "admin" && (
                  <button type="button" onClick={() => deleteRecord(record.id)}>
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
