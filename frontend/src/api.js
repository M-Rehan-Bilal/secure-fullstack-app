/**
 * API client module for Secure Student Registration Application.
 * Communicates with backend REST API using relative URLs (/api/v1/...)
 * Cookies (HttpOnly JWT) are sent automatically via credentials: 'include'.
 */

const API_BASE = '/api/v1'

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const headers = {
    ...(options.headers || {}),
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(options.body)
  }

  const config = {
    ...options,
    headers,
    credentials: 'include', // Essential for sending/receiving HttpOnly cookies
  }

  let res
  try {
    res = await fetch(url, config)
  } catch {
    throw new Error('Network error: Unable to reach the server. Please check backend connection.')
  }

  // Handle Nginx rate limiting (429) specifically
  if (res.status === 429) {
    throw new Error('Too many requests (Rate limit exceeded: 429). Please wait a moment before trying again.')
  }

  // Parse JSON response
  let payload
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    try {
      payload = await res.json()
    } catch {
      payload = null
    }
  }

  if (!res.ok) {
    // If backend provided validation error array: [{ field, message }]
    if (payload && Array.isArray(payload.data) && payload.data.length > 0) {
      const fieldErrors = payload.data
        .map((e) => (e.field ? `${e.field}: ${e.message}` : e.message))
        .join('; ')
      throw new Error(fieldErrors || payload.message || `Request failed (${res.status})`)
    }

    const errorMsg =
      payload?.message ||
      (res.status === 401
        ? 'Authentication required or session expired.'
        : res.status === 403
        ? 'Access denied. You do not have permission for this action.'
        : res.status === 404
        ? 'Requested resource not found.'
        : `Server responded with status ${res.status}`)

    throw new Error(errorMsg)
  }

  return payload ? payload.data : null
}

// Authentication API endpoints
export const authApi = {
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  register: (name, email, password) =>
    request('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    }),

  logout: () =>
    request('/auth/logout', {
      method: 'POST',
    }),

  getMe: () => request('/auth/me', { method: 'GET' }),

  changePassword: (current_password, new_password) =>
    request('/auth/password', {
      method: 'PUT',
      body: { current_password, new_password },
    }),
}

// Student Registrations API endpoints
export const registrationsApi = {
  list: () => request('/registrations', { method: 'GET' }),

  get: (id) => request(`/registrations/${id}`, { method: 'GET' }),

  create: (data) =>
    request('/registrations', {
      method: 'POST',
      body: data,
    }),

  update: (id, data) =>
    request(`/registrations/${id}`, {
      method: 'PUT',
      body: data,
    }),

  delete: (id) =>
    request(`/registrations/${id}`, {
      method: 'DELETE',
    }),
}

// Admin API endpoints
export const adminApi = {
  listUsers: () => request('/admin/users', { method: 'GET' }),

  updateUserRole: (userId, role) =>
    request(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: { role },
    }),
}

// System Health API endpoint
export const healthApi = {
  getHealth: () => request('/health', { method: 'GET' }),
}
