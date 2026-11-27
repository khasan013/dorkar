const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://dorker-backend.onrender.com').trim().replace(/\/$/, '')

async function foodRequest(path, token, { method = 'GET', body, signal } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal,
  })
  const result = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok || result?.success === false) {
    const error = new Error(result?.message || result?.detail || `Food request failed (HTTP ${response.status})`)
    error.status = response.status
    throw error
  }
  return result?.data ?? null
}

export async function getFoodCart(token, signal) {
  try {
    return await foodRequest('/api/v1/food/cart', token, { signal })
  } catch (error) {
    if (error.status === 404) return null
    throw error
  }
}

export function updateFoodCart(cart, token) {
  return foodRequest('/api/v1/food/cart', token, { method: 'PUT', body: cart })
}

export function clearFoodCart(token) {
  return foodRequest('/api/v1/food/cart', token, { method: 'DELETE' })
}

export function checkoutFoodCart(checkout, token) {
  return foodRequest('/api/v1/food/cart/checkout', token, { method: 'POST', body: checkout })
}
