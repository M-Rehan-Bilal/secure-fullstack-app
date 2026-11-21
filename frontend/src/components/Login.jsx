import { useState } from 'react'
import { authApi } from '../api'

export default function Login({ onLoginSuccess, switchToRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isRateLimited, setIsRateLimited] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsRateLimited(false)
    setLoading(true)

    try {
      const user = await authApi.login(email.trim(), password)
      onLoginSuccess(user)
    } catch (err) {
      const msg = err.message || 'Login failed'
      setError(msg)
      if (msg.includes('429') || msg.toLowerCase().includes('rate limit')) {
        setIsRateLimited(true)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h2>Sign In</h2>
        <p className="auth-subtitle">
          Access your secure student registration dashboard
        </p>
      </div>

      {error && (
        <div className={`alert-box ${isRateLimited ? 'alert-warning' : 'alert-danger'}`}>
          <strong>{isRateLimited ? 'Rate Limit Triggered (429)' : 'Error:'}</strong>{' '}
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="login-email">Email Address</label>
          <input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            placeholder="student@itu.edu.pk"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          Don't have an account?{' '}
          <button type="button" className="link-btn" onClick={switchToRegister}>
            Register here
          </button>
        </p>
      </div>
    </div>
  )
}
