import { useState } from 'react'
import { authApi } from '../api'

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.')
      return
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password.')
      return
    }

    setLoading(true)
    try {
      await authApi.changePassword(currentPassword, newPassword)
      setSuccess('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h2>Change Password</h2>
        <p className="auth-subtitle">Update your account login credentials</p>
      </div>

      {error && <div className="alert-box alert-danger">{error}</div>}
      {success && <div className="alert-box alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="current-pw">Current Password</label>
          <input
            id="current-pw"
            type="password"
            required
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="new-pw">New Password</label>
          <input
            id="new-pw"
            type="password"
            required
            minLength={8}
            maxLength={128}
            placeholder="Min 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirm-pw">Confirm New Password</label>
          <input
            id="confirm-pw"
            type="password"
            required
            minLength={8}
            maxLength={128}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Updating Password...' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}
