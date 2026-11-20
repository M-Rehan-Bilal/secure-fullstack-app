export default function Navbar({ user, activeTab, setActiveTab, onLogout }) {
  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">🎓</span>
        <div className="brand-text">
          <span className="brand-title">Secure Portal</span>
          <span className="brand-subtitle">ITU CN Lab Project</span>
        </div>
      </div>

      <nav className="navbar-links">
        {user ? (
          <>
            <button
              className={`nav-btn ${activeTab === 'registrations' ? 'active' : ''}`}
              onClick={() => setActiveTab('registrations')}
            >
              Registrations
            </button>
            <button
              className={`nav-btn ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              Change Password
            </button>
            {user.role === 'admin' && (
              <button
                className={`nav-btn admin-btn ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin')}
              >
                Admin Panel
              </button>
            )}
          </>
        ) : (
          <>
            <button
              className={`nav-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Login
            </button>
            <button
              className={`nav-btn ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              Register
            </button>
          </>
        )}
      </nav>

      <div className="navbar-user">
        {user ? (
          <div className="user-profile">
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className={`role-badge ${user.role}`}>{user.role.toUpperCase()}</span>
            </div>
            <button className="logout-btn" onClick={onLogout} title="Log out">
              Logout
            </button>
          </div>
        ) : (
          <span className="guest-badge">Guest</span>
        )}
      </div>
    </header>
  )
}
