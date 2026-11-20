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

export async function getAdminRequests(accessToken, signal) {
  return adminRequest('/requests', accessToken, signal)
}

export async function getAdminPartners(accessToken, signal) {
  return adminRequest('/partners', accessToken, signal)
}

export async function getAdminTickets(accessToken, signal) {
  return adminRequest('/support/tickets', accessToken, signal)
}
