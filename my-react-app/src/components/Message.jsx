export default function Message({ type = "error", text, details }) {
  if (!text && !details) return null;

  return (
    <div className={`message ${type}`} role="status">
      {text}
      {details && typeof details === "object" && (
        <ul>
          {Object.entries(details).map(([field, reason]) => (
            <li key={field}>
              {field}: {String(reason)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
