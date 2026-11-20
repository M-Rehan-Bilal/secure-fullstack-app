import { useState, useEffect, useCallback } from 'react'
import { authApi } from './api'
import Navbar from './components/Navbar'
import HealthStatus from './components/HealthStatus'
import Login from './components/Login'
import Register from './components/Register'
import ChangePassword from './components/ChangePassword'
import StudentRegistrations from './components/StudentRegistrations'
import AdminPanel from './components/AdminPanel'
import './App.css'

export default function App() {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('login')
  const [loading, setLoading] = useState(true)

  const checkAuth = useCallback(async () => {
    try {
      const userData = await authApi.getMe()
      setUser(userData)
      setActiveTab('registrations')
    } catch {
      setUser(null)
      setActiveTab('login')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    setActiveTab('registrations')
  }

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setUser(null)
      setActiveTab('login')
    }
  }

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading application session...</p>
      </div>
    )
  }

  return (
    <div className="app-container">
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {/* System Health Check & Network Info Bar */}
        <HealthStatus />

        {/* View Routing */}
        {!user ? (
          activeTab === 'register' ? (
            <Register
              onRegisterSuccess={() => setActiveTab('login')}
              switchToLogin={() => setActiveTab('login')}
            />
          ) : (
            <Login
              onLoginSuccess={handleLoginSuccess}
              switchToRegister={() => setActiveTab('register')}
            />
          )
        ) : (
          <>
            {activeTab === 'registrations' && <StudentRegistrations user={user} />}
            {activeTab === 'password' && <ChangePassword />}
            {activeTab === 'admin' && user.role === 'admin' && (
              <AdminPanel currentUser={user} />
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Secure 3-Tier Web Application &bull; VM1 (Frontend) &rarr; VM2 (REST API &amp; Database)
        </p>
      </footer>
    </div>
  )
}
