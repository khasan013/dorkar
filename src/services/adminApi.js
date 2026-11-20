const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://dorker-backend.onrender.com')
  .trim()
  .replace(/\/$/, '')

export async function adminRequest(path, accessToken, signal) {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin${path}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    signal,
  })

  const result = await response.json().catch(() => null)
  if (!response.ok || result?.success === false) {
    const error = new Error(result?.message || `Admin request failed (HTTP ${response.status})`)
    error.status = response.status
    throw error
  }

  return result?.data
}

export async function getAdminDashboard(accessToken, signal) {
  return adminRequest('/dashboard', accessToken, signal)
}

export async function getAdminUsers(accessToken, signal) {
  return adminRequest('/users', accessToken, signal)
}

export async function deleteAdminUser(id, accessToken) {
  return adminMutation(`/users/${encodeURIComponent(id)}`, accessToken, 'DELETE')
}

export async function updateAdminUserStatus(id, enabled, accessToken) {
  return adminMutation(`/users/${encodeURIComponent(id)}/status?enabled=${enabled}`, accessToken, 'PATCH')
}

export async function updateAdminUserRole(id, role, accessToken) {
  return adminMutation(`/users/${encodeURIComponent(id)}/role?role=${encodeURIComponent(role)}`, accessToken, 'PATCH')
}

export async function updateAdminRequestStatus(id, status, accessToken) {
  return adminMutation(`/requests/${encodeURIComponent(id)}/status?status=${encodeURIComponent(status)}`, accessToken, 'PATCH')
}

export async function getAdminRequests(accessToken, signal) {
  return adminRequest('/requests', accessToken, signal)
}

export async function getAdminPartners(accessToken, signal) {
  return adminRequest('/partners', accessToken, signal)
}

export async function submitPartnerApplication(application) {
  const response = await fetch(`${API_BASE_URL}/api/v1/partners/applications`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(application),
  })
  const result = await response.json().catch(() => null)
  if (!response.ok || result?.success === false) {
    const error = new Error(result?.message || `Partner application failed (HTTP ${response.status})`)
    error.status = response.status
    throw error
  }
  return result?.data
}

export async function updateAdminPartnerStatus(id, status, accessToken) {
  return adminMutation(`/partners/${encodeURIComponent(id)}/status?status=${encodeURIComponent(status)}`, accessToken, 'PATCH')
}

export async function getAdminTickets(accessToken, signal) {
  return adminRequest('/support/tickets', accessToken, signal)
}

function toQuery(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, String(value))
  })
  return query.toString()
}

export async function getAdminLogs(filters, accessToken, signal) {
  const query = toQuery(filters)
  return adminRequest(`/logs${query ? `?${query}` : ''}`, accessToken, signal)
}

export async function getAdminLogSummary(filters, accessToken, signal) {
  const query = toQuery(filters)
  return adminRequest(`/logs/summary${query ? `?${query}` : ''}`, accessToken, signal)
}

export async function getAdminLog(id, accessToken, signal) {
  return adminRequest(`/logs/${encodeURIComponent(id)}`, accessToken, signal)
}

export async function exportAdminLogs(filters, accessToken) {
  const query = toQuery(filters)
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/logs/export${query ? `?${query}` : ''}`, {
    headers: { Accept: 'text/csv', Authorization: `Bearer ${accessToken}` },
  })
  if (!response.ok) throw new Error(`Log export failed (HTTP ${response.status})`)
  return response.blob()
}

export async function updateAdminTicketStatus(id, status, accessToken) {
  return adminMutation(`/support/tickets/${encodeURIComponent(id)}/status?status=${encodeURIComponent(status)}`, accessToken, 'PATCH')
}

async function adminMutation(path, accessToken, method, body) {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const result = await response.json().catch(() => null)
  if (!response.ok || result?.success === false) {
    const error = new Error(result?.message || `Admin request failed (HTTP ${response.status})`)
    error.status = response.status
    throw error
  }
  return result?.data
}

export async function getAdminRestaurants(accessToken, signal) {
  const response = await fetch(`${API_BASE_URL}/api/v1/food/restaurants`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` },
    signal,
  })
  const result = await response.json().catch(() => null)
  if (!response.ok || result?.success === false) {
    const error = new Error(result?.message || `Restaurant request failed (HTTP ${response.status})`)
    error.status = response.status
    throw error
  }
  return result?.data
}

export async function createAdminRestaurant(restaurant, accessToken) {
  return adminMutation('/food/restaurants', accessToken, 'POST', restaurant)
}

export async function addAdminMenuItem(restaurantId, item, accessToken) {
  return adminMutation(`/food/restaurants/${encodeURIComponent(restaurantId)}/menu`, accessToken, 'POST', item)
}
