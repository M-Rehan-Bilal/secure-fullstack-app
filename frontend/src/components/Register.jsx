import { useState } from 'react'
import { authApi } from '../api'

export default function Register({ onRegisterSuccess, switchToLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    setLoading(true)
    try {
      await authApi.register(name.trim(), email.trim(), password)
      setSuccessMsg('Account registered successfully! Redirecting to login...')
      if (onRegisterSuccess) onRegisterSuccess()
      setTimeout(() => {
        switchToLogin()
      }, 1500)
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h2>Create Account</h2>
        <p className="auth-subtitle">Register to submit or view student records</p>
      </div>

      {error && <div className="alert-box alert-danger">{error}</div>}
      {successMsg && <div className="alert-box alert-success">{successMsg}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="reg-name">Full Name</label>
          <input
            id="reg-name"
            type="text"
            required
            minLength={2}
            maxLength={50}
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="reg-email">Email Address</label>
          <input
            id="reg-email"
            type="email"
            required
            minLength={5}
            maxLength={50}
            placeholder="student@itu.edu.pk"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="reg-password">Password</label>
          <input
            id="reg-password"
            type="password"
            required
            minLength={8}
            maxLength={128}
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <small className="form-hint">
            Hashed using Argon2id on the backend before storage.
          </small>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          Already have an account?{' '}
          <button type="button" className="link-btn" onClick={switchToLogin}>
            Sign in here
          </button>
        </p>
      </div>
    </div>
  )
}
