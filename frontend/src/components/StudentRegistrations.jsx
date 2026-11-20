import { useState, useEffect, useCallback } from 'react'
import { registrationsApi } from '../api'

export default function StudentRegistrations({ user }) {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Form state
  const [editingId, setEditingId] = useState(null)
  const [fullName, setFullName] = useState('')
  const [rollNumber, setRollNumber] = useState('')
  const [department, setDepartment] = useState('Computer Science')
  const [semester, setSemester] = useState(1)
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchRegistrations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await registrationsApi.list()
      setRegistrations(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Failed to fetch registrations')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRegistrations()
  }, [fetchRegistrations])

  const resetForm = () => {
    setEditingId(null)
    setFullName('')
    setRollNumber('')
    setDepartment('Computer Science')
    setSemester(1)
    setPhone('')
  }

  const handleStartEdit = (reg) => {
    setEditingId(reg.id)
    setFullName(reg.full_name)
    setRollNumber(reg.roll_number)
    setDepartment(reg.department)
    setSemester(reg.semester)
    setPhone(reg.phone)
    setError(null)
    setSuccess(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSubmitting(true)

    const payload = {
      full_name: fullName.trim(),
      roll_number: rollNumber.trim(),
      department: department.trim(),
      semester: parseInt(semester, 10),
      phone: phone.trim(),
    }

    try {
      if (editingId) {
        await registrationsApi.update(editingId, payload)
        setSuccess('Registration updated successfully!')
      } else {
        await registrationsApi.create(payload)
        setSuccess('Student registered successfully!')
      }
      resetForm()
      await fetchRegistrations()
    } catch (err) {
      setError(err.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete registration for ${name}?`)) {
      return
    }

    setError(null)
    setSuccess(null)
    try {
      await registrationsApi.delete(id)
      setSuccess('Registration deleted successfully.')
      if (editingId === id) {
        resetForm()
      }
      await fetchRegistrations()
    } catch (err) {
      setError(err.message || 'Failed to delete registration')
    }
  }

  return (
    <div className="registrations-page">
      <div className="section-header">
        <div>
          <h2>Student Registrations</h2>
          <p className="subtitle">
            {user.role === 'admin'
              ? 'Administrator View: Showing all students registered in the system.'
              : 'Submit or manage your student registration details.'}
          </p>
        </div>
      </div>

      {error && <div className="alert-box alert-danger">{error}</div>}
      {success && <div className="alert-box alert-success">{success}</div>}

      {/* Registration Form */}
      <div className="card form-card">
        <div className="form-card-header">
          <h3>{editingId ? 'Edit Student Registration' : 'New Student Registration'}</h3>
          {editingId && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={resetForm}>
              Cancel Editing
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="reg-grid-form">
          <div className="form-group">
            <label htmlFor="full-name">Full Name *</label>
            <input
              id="full-name"
              type="text"
              required
              minLength={2}
              maxLength={50}
              placeholder="e.g. John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="roll-number">Roll Number *</label>
            <input
              id="roll-number"
              type="text"
              required
              minLength={3}
              maxLength={30}
              placeholder="e.g. BCS-F22-042"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
            />
            <small className="form-hint">Alphanumeric and hyphens only.</small>
          </div>

          <div className="form-group">
            <label htmlFor="department">Department *</label>
            <select
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="Computer Science">Computer Science</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Data Science">Data Science</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="semester">Semester (1 - 8) *</label>
            <select
              id="semester"
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group span-2">
            <label htmlFor="phone">Phone Number (Encrypted Field) *</label>
            <input
              id="phone"
              type="text"
              required
              pattern="^\+?[0-9]{10,15}$"
              placeholder="+923001234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <small className="form-hint crypto-hint">
              🔒 Field-Level Encryption: Encrypted with <strong>AES-256-GCM</strong> on VM2 before DB storage.
            </small>
          </div>

          <div className="form-actions span-2">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting
                ? 'Saving...'
                : editingId
                ? 'Update Registration'
                : 'Submit Registration'}
            </button>
          </div>
        </form>
      </div>

      {/* Registrations List */}
      <div className="card table-card">
        <div className="table-header">
          <h3>Stored Student Records ({registrations.length})</h3>
          <button
            className="btn btn-secondary btn-sm"
            onClick={fetchRegistrations}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh List'}
          </button>
        </div>

        {registrations.length === 0 ? (
          <div className="empty-state">
            <p>No student registrations found.</p>
            <small>Fill out the form above to add your student record.</small>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student Name</th>
                  <th>Roll Number</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>Phone (Decrypted)</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => (
                  <tr key={reg.id}>
                    <td>#{reg.id}</td>
                    <td className="font-semibold">{reg.full_name}</td>
                    <td>
                      <span className="badge badge-code">{reg.roll_number}</span>
                    </td>
                    <td>{reg.department}</td>
                    <td>Sem {reg.semester}</td>
                    <td>
                      <span className="phone-protected" title="Decrypted from AES-256-GCM ciphertext">
                        🔑 {reg.phone}
                      </span>
                    </td>
                    <td className="text-muted">
                      {new Date(reg.created_at).toLocaleString()}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action edit"
                          onClick={() => handleStartEdit(reg)}
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          className="btn-action delete"
                          onClick={() => handleDelete(reg.id, reg.full_name)}
                          title="Delete"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
