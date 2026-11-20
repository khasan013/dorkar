import { adminRequest } from './adminApi'

function request(path, token, method = 'GET', body, signal) {
  return fetch(`${(import.meta.env.VITE_API_BASE_URL || 'https://dorker-backend.onrender.com').trim().replace(/\/$/, '')}/api/v1/admin${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal,
  }).then(async response => {
    const result = await response.json().catch(() => null)
    if (!response.ok || result?.success === false) {
      const error = new Error(result?.message || `Promotion request failed (HTTP ${response.status})`)
      error.status = response.status
      throw error
    }
    return result?.data
  })
}

const list = (name, token, signal) => request(`/${name}`, token, 'GET', undefined, signal)
  .then(items => Array.isArray(items) ? items.map(item => ({
    ...item,
    code: item.code ?? item.couponCode ?? null,
    bannerImageUrl: item.bannerImageUrl ?? item.desktopImageUrl ?? null,
  })) : [])
const save = (name, id, value, token) => request(`/${name}${id ? `/${encodeURIComponent(id)}` : ''}`, token, id ? 'PATCH' : 'POST', value)
const remove = (name, id, token) => request(`/${name}/${encodeURIComponent(id)}`, token, 'DELETE')
const setStatus = (name, id, status, token) => request(`/${name}/${encodeURIComponent(id)}/status?status=${encodeURIComponent(status)}`, token, 'PATCH')

export const getAdminPromotionSummary = (token, signal) => adminRequest('/promotions/summary', token, signal)
export const getAdminPromotions = (token, signal) => list('promotions', token, signal)
export const getAdminCoupons = (token, signal) => list('coupons', token, signal)
export const getAdminBanners = (token, signal) => list('banners', token, signal)
export const createAdminPromotion = (value, token) => save('promotions', null, value, token)
export const updateAdminPromotion = (id, value, token) => save('promotions', id, value, token)
export const createAdminCoupon = (value, token) => save('coupons', null, value, token)
export const updateAdminCoupon = (id, value, token) => save('coupons', id, value, token)
export const createAdminBanner = (value, token) => save('banners', null, value, token)
export const updateAdminBanner = (id, value, token) => save('banners', id, value, token)
export const deleteAdminPromotion = (id, token) => remove('promotions', id, token)
export const deleteAdminCoupon = (id, token) => remove('coupons', id, token)
export const deleteAdminBanner = (id, token) => remove('banners', id, token)
export const setAdminPromotionStatus = (id, status, token) => setStatus('promotions', id, status, token)
export const setAdminCouponStatus = (id, status, token) => setStatus('coupons', id, status, token)
export const setAdminBannerStatus = (id, status, token) => setStatus('banners', id, status, token)

export async function uploadAdminBannerImage(file, token) {
  const base = (import.meta.env.VITE_API_BASE_URL || 'https://dorker-backend.onrender.com').trim().replace(/\/$/, '')
  const form = new FormData()
  form.append('file', file)
  const response = await fetch(`${base}/api/v1/admin/banners/upload`, {
    method: 'POST',
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    body: form,
  })
  const result = await response.json().catch(() => null)
  if (!response.ok || result?.success === false) {
    const error = new Error(result?.message || `Banner upload failed (HTTP ${response.status})`)
    error.status = response.status
    throw error
  }
  return result?.data
}
