import { useCallback, useEffect, useMemo, useState } from 'react'
import { readAuthSession } from '../../auth/session'
import { addAdminMenuItem, createAdminRestaurant, getAdminRestaurants, updateAdminRestaurant, uploadAdminRestaurantLogo } from '../../services/adminApi'
import RestaurantLocationMap from '../../components/RestaurantLocationMap'
import AdminLayout, { AdminIcon } from './AdminLayout'
import './FoodManagementPage.css'

const slugify = value => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export default function FoodManagementPage() {
  const session = readAuthSession()
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const [dialog, setDialog] = useState(null)
  const [restaurantPin, setRestaurantPin] = useState({ latitude: '', longitude: '' })

  const openRestaurantForm = restaurant => {
    setRestaurantPin({ latitude: restaurant?.latitude ?? '', longitude: restaurant?.longitude ?? '' })
    setDialog(restaurant ? { type: 'restaurant', restaurant } : { type: 'restaurant' })
  }

  const loadRestaurants = useCallback(async (signal) => {
    setLoading(true)
    setError('')
    try {
      const result = await getAdminRestaurants(session?.accessToken, signal)
      setRestaurants(Array.isArray(result) ? result : [])
    } catch (requestError) {
      if (requestError.name !== 'AbortError') setError(requestError.status === 401 || requestError.status === 403
        ? 'Administrator access is required to manage restaurant records.'
        : requestError.message || 'Restaurant records could not be loaded.')
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [session?.accessToken])

  useEffect(() => {
    const controller = new AbortController()
    loadRestaurants(controller.signal)
    return () => controller.abort()
  }, [loadRestaurants])

  const visibleRestaurants = useMemo(() => {
    const search = query.trim().toLowerCase()
    return restaurants.filter(item => !search || [item.name, item.cuisine, item.area, item.slug].some(value => String(value || '').toLowerCase().includes(search)))
  }, [restaurants, query])

  const submitRestaurant = async event => {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity()) return
    const data = new FormData(form)
    const name = String(data.get('name') || '').trim()
    const payload = {
      slug: String(data.get('slug') || '').trim() || slugify(name) || `restaurant-${Date.now()}`,
      name,
      cuisine: String(data.get('cuisine') || '').trim(),
      description: String(data.get('description') || '').trim(),
      area: String(data.get('area') || '').trim(),
      address: String(data.get('address') || '').trim(),
      latitude: Number(restaurantPin.latitude || data.get('latitude')),
      longitude: Number(restaurantPin.longitude || data.get('longitude')),
      imageUrl: String(data.get('imageUrl') || '').trim(),
      rating: Number(data.get('rating')) || 0,
      deliveryTime: String(data.get('deliveryTime') || '').trim(),
      active: dialog.restaurant?.active ?? true,
    }
    setSaving(true)
    setError('')
    try {
      const logoFile = data.get('logoFile')
      if (logoFile instanceof File && logoFile.size) {
        const uploadedLogo = await uploadAdminRestaurantLogo(logoFile, session?.accessToken)
        payload.imageUrl = uploadedLogo?.secureUrl || ''
      }
      if (!payload.imageUrl) throw new Error('Choose a restaurant logo image or enter its image URL.')
      if (dialog.restaurant) {
        await updateAdminRestaurant(dialog.restaurant.id, payload, session?.accessToken)
        setNotice(`${name} restaurant details updated.`)
      } else {
        await createAdminRestaurant(payload, session?.accessToken)
        setNotice('Restaurant added to the catalog.')
      }
      setDialog(null)
      await loadRestaurants()
    } catch (requestError) {
      setError(requestError.message || 'Restaurant could not be added.')
    } finally { setSaving(false) }
  }

  const submitMenuItem = async event => {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity()) return
    const data = new FormData(form)
    const name = String(data.get('name') || '').trim()
    const payload = {
      slug: String(data.get('slug') || '').trim() || slugify(name) || `menu-item-${Date.now()}`,
      name,
      description: String(data.get('description') || '').trim(),
      price: Number(data.get('price')),
      imageUrl: String(data.get('imageUrl') || '').trim(),
      available: true,
    }
    setSaving(true)
    setError('')
    try {
      await addAdminMenuItem(dialog.restaurant.id, payload, session?.accessToken)
      setNotice(`Menu item added to ${dialog.restaurant.name}.`)
      setDialog(null)
      await loadRestaurants()
    } catch (requestError) {
      setError(requestError.message || 'Menu item could not be added.')
    } finally { setSaving(false) }
  }

  return <AdminLayout title="Food Management" description="Review published restaurants and add restaurants or available menu items.">
    <div className="admin-food-page">
      {error && <div className="admin-food-alert" role="alert"><AdminIcon name="shield" size={18}/><p>{error}</p><button type="button" onClick={() => loadRestaurants()}>Retry</button></div>}
      {notice && <div className="admin-food-notice" role="status"><span>✓</span><p>{notice}</p><button type="button" onClick={() => setNotice('')} aria-label="Dismiss notice">×</button></div>}

      <section className="admin-food-summary"><article><span className="admin-food-summary-icon orange"><AdminIcon name="food"/></span><div><small>Restaurant records</small><b>{loading ? '—' : restaurants.length.toLocaleString('en-BD')}</b><span>Admin-managed restaurants</span></div></article><article><span className="admin-food-summary-icon blue"><AdminIcon name="clipboard"/></span><div><small>Locations configured</small><b>{loading ? '—' : restaurants.filter(item => item.latitude != null && item.longitude != null && item.address).length.toLocaleString('en-BD')}</b><span>Address and map pin saved</span></div></article><article><span className="admin-food-summary-icon green"><AdminIcon name="shield"/></span><div><small>Catalog source</small><b className="admin-food-summary-label">Live</b><span>Protected admin API</span></div></article></section>

      <section className="admin-food-panel">
        <div className="admin-food-heading"><div><h2>Restaurant catalog</h2><p>Set restaurant identity, exact address, and map location.</p></div><button type="button" className="admin-food-primary" onClick={() => openRestaurantForm(null)}><span>＋</span>Add restaurant</button></div>
        <div className="admin-food-toolbar"><label><AdminIcon name="search" size={17}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search restaurant, cuisine, or area…" aria-label="Search restaurants"/></label><span>{visibleRestaurants.length} shown</span></div>
        <div className="admin-food-table-scroll"><table className="admin-food-table"><thead><tr><th>Restaurant</th><th>Cuisine</th><th>Area</th><th>Delivery time</th><th>Catalog status</th><th>Actions</th></tr></thead><tbody>
          {loading && Array.from({ length: 4 }, (_, index) => <tr key={index} className="admin-food-loading"><td colSpan="6"><i/></td></tr>)}
          {!loading && visibleRestaurants.map(restaurant => <tr key={restaurant.id || restaurant.slug}><td><div className="admin-food-restaurant">{restaurant.imageUrl ? <img src={restaurant.imageUrl} alt="" loading="lazy"/> : <span className="admin-food-restaurant-fallback"><AdminIcon name="food" size={18}/></span>}<span><b>{restaurant.name}</b><small>#{restaurant.slug || restaurant.id}</small></span></div></td><td>{restaurant.cuisine || '—'}</td><td>{restaurant.address || restaurant.area || '—'}</td><td>{restaurant.deliveryTime || '—'}</td><td><span className={`admin-food-status ${restaurant.active ? 'active' : 'inactive'}`}>{restaurant.active ? 'Published' : 'Pending approval'}</span></td><td><button type="button" className="admin-food-menu-action" onClick={() => openRestaurantForm(restaurant)}>Edit restaurant</button><button type="button" className="admin-food-menu-action" onClick={() => setDialog({ type: 'menu', restaurant })}>＋ Menu item</button></td></tr>)}
          {!loading && visibleRestaurants.length === 0 && <tr><td colSpan="6"><div className="admin-food-empty"><span><AdminIcon name="food" size={23}/></span><b>{restaurants.length ? 'No restaurants match this search' : 'No restaurant listings yet'}</b><p>{restaurants.length ? 'Try another restaurant name, cuisine, or area.' : 'Add a restaurant to start building the food catalog.'}</p></div></td></tr>}
        </tbody></table></div>
        <div className="admin-food-foot">Administrators can update restaurant branding, description, address, and map pin here. Restaurant accounts can view these details but cannot edit them.</div>
      </section>
    </div>

    {dialog && <div className="admin-food-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !saving) setDialog(null) }}><section className="admin-food-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-food-dialog-title"><button className="admin-food-dialog-close" type="button" onClick={() => setDialog(null)} aria-label="Close">×</button><span className="admin-food-dialog-icon"><AdminIcon name={dialog.type === 'restaurant' ? 'food' : 'clipboard'}/></span><h2 id="admin-food-dialog-title">{dialog.type === 'restaurant' ? (dialog.restaurant ? 'Edit restaurant details' : 'Add restaurant') : 'Add menu item'}</h2>{dialog.type === 'menu' && <p className="admin-food-dialog-subtitle">{dialog.restaurant.name}</p>}
      {dialog.type === 'restaurant' ? <form onSubmit={submitRestaurant} className="admin-food-form"><label>Restaurant name<input name="name" required maxLength="140" defaultValue={dialog.restaurant?.name || ''} placeholder="e.g. Kacchi Bhai"/></label><label>Slug<input name="slug" maxLength="80" defaultValue={dialog.restaurant?.slug || ''} placeholder="Generated from restaurant name if empty"/></label><label>Cuisine<input name="cuisine" required maxLength="80" defaultValue={dialog.restaurant?.cuisine || ''} placeholder="Bangladeshi"/></label><label>Service area<input name="area" required maxLength="140" defaultValue={dialog.restaurant?.area || ''} placeholder="Gulshan, Dhaka"/></label><label>Delivery time<input name="deliveryTime" required maxLength="40" defaultValue={dialog.restaurant?.deliveryTime || '30–45 min'}/></label><label>Rating<input name="rating" type="number" min="0" max="5" step="0.1" defaultValue={dialog.restaurant?.rating ?? 0}/></label><label className="full">Exact restaurant address<input name="address" required maxLength="300" defaultValue={dialog.restaurant?.address || ''} placeholder="Building, road, area, city"/></label><label className="full">Restaurant logo image URL<input name="imageUrl" maxLength="500" type="url" defaultValue={dialog.restaurant?.imageUrl || ''} placeholder="Keep or paste an image URL"/></label><label className="full">Or upload a logo<input name="logoFile" type="file" accept="image/png,image/jpeg,image/webp"/></label><label className="full">Description<textarea name="description" required rows="2" maxLength="500" defaultValue={dialog.restaurant?.description || ''} placeholder="Restaurant details"/></label><div className="admin-food-location-fields"><label>Latitude<input name="latitude" required type="number" min="-90" max="90" step="0.000001" value={restaurantPin.latitude} onChange={event=>setRestaurantPin(pin=>({...pin,latitude:event.target.value}))}/></label><label>Longitude<input name="longitude" required type="number" min="-180" max="180" step="0.000001" value={restaurantPin.longitude} onChange={event=>setRestaurantPin(pin=>({...pin,longitude:event.target.value}))}/></label></div><RestaurantLocationMap latitude={restaurantPin.latitude} longitude={restaurantPin.longitude} onChange={setRestaurantPin} editable height={250}/><button type="submit" disabled={saving}>{saving ? 'Saving…' : dialog.restaurant ? 'Save restaurant details' : 'Create restaurant'}</button></form> : <form onSubmit={submitMenuItem} className="admin-food-form"><label>Item name<input name="name" required maxLength="140" placeholder="Menu item name"/></label><label>Slug<input name="slug" maxLength="80" placeholder="Generated from item name if empty"/></label><label>Price (৳)<input name="price" type="number" min="0.01" step="0.01" required placeholder="350"/></label><label>Image URL<input name="imageUrl" type="url" maxLength="500" placeholder="https://…"/></label><label className="full">Description<textarea name="description" rows="3" maxLength="500" placeholder="Describe this menu item"/></label><button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Add available menu item'}</button></form>}</section></div>}
  </AdminLayout>
}
