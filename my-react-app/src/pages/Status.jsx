import { useEffect, useState } from "react";
import { api } from "../api";
import Message from "../components/Message";

export default function Status() {
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    setMessage("");
    const response = await api("/health");
    setLoading(false);

    if (response.status === 200) {
      setStatus(response.json?.data || null);
    } else {
      setStatus(null);
      setMessage("Server error. Please try again later.");
    }
  }

  useEffect(() => {
    let active = true;
    api("/health").then((response) => {
      if (!active) return;
      if (response.status === 200) {
        setStatus(response.json?.data || null);
      } else {
        setMessage("Server error. Please try again later.");
      }
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section>
      <h1>Backend Status</h1>
      <div className="status-box">
        {status && (
          <>
            <p><strong>Hostname:</strong> {status.hostname}</p>
            <p><strong>IP:</strong> {status.ip}</p>
            <p><strong>Database:</strong> {status.database ? "true" : "false"}</p>
          </>
        )}
        <Message text={message} />
        <button type="button" onClick={refresh} disabled={loading}>Refresh</button>
      </div>
    </section>
  );
}
