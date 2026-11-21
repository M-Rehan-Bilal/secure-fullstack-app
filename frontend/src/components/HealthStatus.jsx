import { useState, useEffect } from 'react'
import { healthApi } from '../api'

export default function HealthStatus() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const checkHealth = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await healthApi.getHealth()
      setHealth(data)
    } catch (err) {
      setError(err.message || 'Health check failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
    const timer = setInterval(checkHealth, 30000) // check every 30s
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="health-card">
      <div className="health-header">
        <span className="health-title">
          <span className="status-dot-pulse"></span>
          System Network & Health Status (/api/v1/health)
        </span>
        <button
          className="health-refresh-btn"
          onClick={checkHealth}
          disabled={loading}
          title="Refresh Health Status"
        >
          {loading ? 'Checking...' : 'Refresh'}
        </button>
      </div>

      <div className="health-grid">
        <div className="health-item">
          <span className="health-label">Backend Hostname:</span>
          <span className="health-value">
            {health ? health.hostname : error ? 'Offline' : '...'}
          </span>
        </div>

        <div className="health-item">
          <span className="health-label">Backend Lab IP:</span>
          <span className="health-value code-pill">
            {health ? health.ip_address : error ? 'Unreachable' : '...'}
          </span>
        </div>

        <div className="health-item">
          <span className="health-label">Database Status:</span>
          {health?.database_reachable ? (
            <span className="db-badge online">Connected (TCP 127.0.0.1)</span>
          ) : (
            <span className="db-badge offline">
              {error ? 'API Unreachable' : 'Disconnected'}
            </span>
          )}
        </div>
      </div>
      {error && <div className="health-error">Notice: {error}</div>}
    </div>
  )
}
