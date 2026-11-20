import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import "./App.css";

type Student = { id: number; full_name: string; roll_number: string; department: string; semester: number; phone: string };
type Page = "login" | "register" | "password" | "students";
const API_URL = import.meta.env.VITE_API_URL ?? "";

async function request(path: string, options?: RequestInit) {
  const response = await fetch(`${API_URL}/api${path}`, {
    ...options, credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong. Please try again.");
  return data;
}

export default function App() {
  const [page, setPage] = useState<Page>("login");
  const [students, setStudents] = useState<Student[]>([]);
  const [message, setMessage] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [busy, setBusy] = useState(false);

  async function loadStudents() {
    try { const data = await request("/students"); setStudents(data.students ?? []); }
    catch (error) { setMessage((error as Error).message); }
  }
  useEffect(() => { if (authenticated) void loadStudents(); }, [authenticated]);

  async function submit(event: FormEvent<HTMLFormElement>, path: string) {
    event.preventDefault(); setMessage(""); setBusy(true);
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form).entries());
    try {
      await request(path, { method: "POST", body: JSON.stringify(body) });
      if (path === "/auth/login" || path === "/auth/register") { setAuthenticated(true); setPage("students"); setMessage("Welcome! You’re signed in."); }
      else if (path === "/students") { await loadStudents(); form.reset(); setMessage("Student registration saved."); }
      else setMessage("Password updated successfully.");
    } catch (error) { setMessage((error as Error).message); }
    finally { setBusy(false); }
  }

  const go = (next: Page) => { setPage(next); setMessage(""); };
  return <div className="portal">
    <aside className="sidebar"><a className="brand" href="#home" onClick={(e) => { e.preventDefault(); go("students"); }}><span className="brand-icon">S</span><span>Campus<span className="brand-muted">Connect</span></span></a>
      <div className="side-caption">YOUR PORTAL</div><nav className="nav-list">
        <button className={page === "students" ? "nav-link current" : "nav-link"} onClick={() => go("students")}><span>▦</span> Student registration</button>
        <button className={page === "password" ? "nav-link current" : "nav-link"} onClick={() => go("password")}><span>⚙</span> Account settings</button>
      </nav>
      <div className="sidebar-note"><span className="note-mark">✦</span><b>Your campus journey</b><p>Keep your student information up to date, all in one place.</p></div>
      <div className="side-bottom">STUDENT SERVICES <span>•</span> PORTAL</div>
    </aside>
    <main className="main"><header className="topbar"><div className="crumb">CampusConnect <span>/</span> <b>{page === "students" ? "Student registration" : page === "password" ? "Account settings" : page === "login" ? "Sign in" : "Create account"}</b></div><div className="secure"><span>●</span> Secure student portal</div></header>
      <div className="content">
        {page === "students" && <>
          <section className="hero"><div className="hero-copy"><span className="kicker">STUDENT SERVICES</span><h1>A great start begins<br />with your details.</h1><p>Register your student information and keep your campus record organized.</p></div><div className="hero-art"><div className="sun"/><div className="book"><i/><i/><i/></div><div className="sparkle">✦</div><div className="circle-line"/></div></section>
          <div className="section-heading"><div><span className="eyebrow">STUDENT PROFILE</span><h2>Registration details</h2><p>Fields marked with <em>*</em> are required.</p></div><span className="step-pill"><b>01</b> &nbsp;PROFILE</span></div>
          <section className="card"><form onSubmit={(e) => void submit(e, "/students")}><div className="form-grid">
            <label>Full name <em>*</em><input name="full_name" placeholder="Enter your full name" maxLength={50} required /></label>
            <label>Roll number <em>*</em><input name="roll_number" placeholder="e.g. CS-2026-0142" maxLength={30} required /></label>
            <label>Department <em>*</em><select name="department" defaultValue="" required><option value="" disabled>Select your department</option><option>Computer Science</option><option>Business Administration</option><option>Engineering</option><option>Arts &amp; Humanities</option><option>Natural Sciences</option><option>Social Sciences</option><option>Other</option></select></label>
            <label>Semester <em>*</em><select name="semester" defaultValue="" required><option value="" disabled>Select semester</option>{Array.from({ length: 8 }, (_, i) => <option key={i + 1} value={i + 1}>Semester {i + 1}</option>)}</select><small>Choose from semester 1 to 8.</small></label>
            <label className="full">Phone number <em>*</em><input name="phone" type="tel" placeholder="Include your country code, e.g. +1 555 0123" required /></label>
          </div><div className="form-actions">{message && <span className="notice">{message}</span>}<button className="primary" disabled={busy}>{busy ? "Saving…" : "Save registration"}<span>→</span></button></div></form></section>
          <section className="records"><div className="records-title"><div><span className="eyebrow">YOUR INFORMATION</span><h2>Saved registrations</h2></div><button className="refresh" onClick={() => void loadStudents()}>↻ &nbsp;Refresh</button></div>
            {students.length === 0 ? <div className="empty"><div>▤</div><b>No registrations yet</b><p>Your saved student records will appear here.</p></div> : <div className="table-scroll"><table><thead><tr><th>STUDENT</th><th>ROLL NUMBER</th><th>DEPARTMENT</th><th>SEMESTER</th><th>PHONE</th></tr></thead><tbody>{students.map(s => <tr key={s.id}><td><span className="student-avatar">{s.full_name.slice(0, 1).toUpperCase()}</span>{s.full_name}</td><td>{s.roll_number}</td><td>{s.department}</td><td><span className="semester">{s.semester}</span></td><td>{s.phone}</td></tr>)}</tbody></table></div>}
          </section>
        </>}
        {(page === "login" || page === "register") && <section className="auth-wrap"><div className="auth-card"><span className="eyebrow">CAMPUSCONNECT ACCOUNT</span><h1>{page === "login" ? "Welcome back" : "Join your campus portal"}</h1><p className="auth-sub">{page === "login" ? "Sign in to manage your student registration." : "Create an account to get started."}</p><div className="tabs"><button className={page === "login" ? "tab active-tab" : "tab"} onClick={() => go("login")}>Sign in</button><button className={page === "register" ? "tab active-tab" : "tab"} onClick={() => go("register")}>Create account</button></div><form onSubmit={(e) => void submit(e, page === "login" ? "/auth/login" : "/auth/register")} className="auth-form">{page === "register" && <label>Full name<input name="name" maxLength={50} placeholder="Your name" required /></label>}<label>Email address<input name="email" type="email" maxLength={50} placeholder="you@university.edu" required /></label><label>Password<input name="password" type="password" minLength={8} placeholder="Enter your password" required /></label>{message && <p className="notice">{message}</p>}<button className="primary wide-button" disabled={busy}>{busy ? "Please wait…" : page === "login" ? "Sign in" : "Create account"}<span>→</span></button></form><p className="auth-foot">Your account details are handled securely by your institution.</p></div></section>}
        {page === "password" && <section className="settings"><span className="eyebrow">ACCOUNT SECURITY</span><h1>Change your password</h1><p className="auth-sub">Choose a new password for your account.</p><div className="card"><form className="settings-form" onSubmit={(e) => void submit(e, "/auth/change-password")}><label>Current password<input name="current_password" type="password" required /></label><label>New password<input name="new_password" type="password" minLength={8} required /></label>{message && <p className="notice">{message}</p>}<button className="primary" disabled={busy}>Update password <span>→</span></button></form></div></section>}
        <footer className="footer">CampusConnect <span>•</span> Student Registration Portal</footer>
      </div>
    </main>
  </div>;
}
