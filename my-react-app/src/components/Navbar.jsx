import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../useAuth";

export default function Navbar() {
  const { user, clearUser } = useAuth();
  const navigate = useNavigate();

  async function logout() {
    await api("/auth/logout", { method: "POST" });
    clearUser();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/records">Records</Link>
            <Link to="/change-password">Change Password</Link>
          </>
        ) : (
          <>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
          </>
        )}
        <Link to="/status">Status</Link>
      </div>
      {user && (
        <div className="nav-user">
          <span>
            Logged in as {user.username} ({user.role})
          </span>
          <button type="button" className="link-button" onClick={logout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
