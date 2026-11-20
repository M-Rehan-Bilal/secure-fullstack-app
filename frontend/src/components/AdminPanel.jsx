import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '../api'

export default function AdminPanel({ currentUser }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminApi.listUsers()
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleRoleToggle = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    const confirmMsg = `Are you sure you want to change ${user.name}'s role to "${newRole.toUpperCase()}"?`

    if (!window.confirm(confirmMsg)) return

    setError(null)
    setSuccess(null)
    setUpdatingId(user.id)

    try {
      await adminApi.updateUserRole(user.id, newRole)
      setSuccess(`Updated role for ${user.email} to ${newRole}.`)
      await fetchUsers()
    } catch (err) {
      setError(err.message || 'Failed to update user role')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="admin-page">
      <div className="section-header">
        <div>
          <h2>User Administration</h2>
          <p className="subtitle">
            Admin Route (/api/v1/admin/users) - Manage user roles and permissions
          </p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={fetchUsers}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Users'}
        </button>
      </div>

      {error && <div className="alert-box alert-danger">{error}</div>}
      {success && <div className="alert-box alert-success">{success}</div>}

      <div className="card table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Registered At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id
                return (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td className="font-semibold">{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge ${u.role}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-muted">
                      {new Date(u.created_at).toLocaleString()}
                    </td>
                    <td>
                      {isSelf ? (
                        <span className="self-label">(Current User)</span>
                      ) : (
                        <button
                          className={`btn-action ${
                            u.role === 'admin' ? 'demote' : 'promote'
                          }`}
                          disabled={updatingId === u.id}
                          onClick={() => handleRoleToggle(u)}
                        >
                          {updatingId === u.id
                            ? 'Updating...'
                            : u.role === 'admin'
                            ? 'Demote to User'
                            : 'Promote to Admin'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
