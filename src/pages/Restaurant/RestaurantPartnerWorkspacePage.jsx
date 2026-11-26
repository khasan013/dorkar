import { useCallback, useEffect, useMemo, useState } from 'react'
import { readAuthSession } from '../../auth/session'
import './RestaurantPartnerWorkspacePage.css'

const API = (import.meta.env.VITE_API_BASE_URL || 'https://dorker-backend.onrender.com').trim().replace(/\/$/, '')
const sections = {
  orders: ['Orders', 'Review incoming orders and move them through preparation and completion.'],
  menu: ['Menu / Items', 'Create, update, price, and publish your food menu.'],
  categories: ['Categories', 'Organize menu items by the categories customers use to browse.'],
  promotions: ['Promotions & Offers', 'Create restaurant offers and upload food artwork for them.'],
  reviews: ['Reviews', 'Review customer feedback for your restaurant.'],
  analytics: ['Analytics', 'Track orders and completed order revenue over time.'],
  payouts: ['Payouts & Earnings', 'View payout information when settlement records are connected.'],
  profile: ['Restaurant Profile', 'Update the restaurant details customers see in Dorkar.'],
  staff: ['Staff & Access', 'Staff access management is not connected to the backend yet.'],
  settings: ['Settings', 'Manage restaurant availability and account preferences.'],
}
const navigation = [
  ['dashboard', 'Dashboard', '/restaurant/dashboard'], ['orders', 'Orders', '/restaurant/orders'],
  ['menu', 'Menu / Items', '/restaurant/menu'], ['layers', 'Categories', '/restaurant/categories'],
  ['tag', 'Promotions & Offers', '/restaurant/promotions'], ['star', 'Reviews', '/restaurant/reviews'],
  ['chart', 'Analytics', '/restaurant/analytics'], ['wallet', 'Payouts & Earnings', '/restaurant/payouts'],
  ['store', 'Restaurant Profile', '/restaurant/profile'], ['users', 'Staff & Access', '/restaurant/staff'],
  ['settings', 'Settings', '/restaurant/settings'],
]
const money = value => `৳ ${Number(value || 0).toLocaleString('en-BD', { maximumFractionDigits: 0 })}`
const slugify = value => String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

async function request(path, token, options = {}) {
  const response = await fetch(`${API}/api/v1/restaurant/partner${path}`, {
    method: options.method || 'GET',
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}`, ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}) },
    ...(options.body ? { body: options.body instanceof FormData ? options.body : JSON.stringify(options.body) } : {}),
    signal: options.signal,
  })
  const result = await response.json().catch(() => null)
  if (!response.ok || result?.success === false) throw new Error(result?.message || `Request failed (HTTP ${response.status})`)
  return result?.data
}

function Glyph({ name, size = 18 }) {
  const shapes = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    bag: <><path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></>,
    menu: <><path d="M4 5h16M4 12h16M4 19h16"/></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></>,
    tag: <><path d="m20 13-7 7L3 10V4h6l11 9Z"/><circle cx="7.5" cy="7.5" r="1"/></>,
    star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.4l6.1-.9L12 3Z"/>,
    chart: <><path d="M4 20V11m5 9V5m6 15v-7m5 7V3"/></>,
    wallet: <><rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 9h18m-5 5h2"/></>,
    store: <><path d="M4 10v10h16V10M3 4h18l-2 6H5L3 4Z"/><path d="M9 20v-6h6v6"/></>,
    users: <><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0m1-9a3 3 0 1 0-1-5.8M17 14a5 5 0 0 1 4 5"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19 13 2 1-2 4-2-1a8 8 0 0 1-3 1l-.5 2h-4L9 18a8 8 0 0 1-2-1l-2 1-2-4 2-1a7 7 0 0 1 0-2L3 10l2-4 2 1a8 8 0 0 1 2-1l.5-2h4l.5 2a8 8 0 0 1 2 1l2-1 2 4-2 1a7 7 0 0 1 0 2Z"/></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></>,
    plus: <path d="M12 5v14m-7-7h14"/>,
    edit: <><path d="m15 5 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15Z"/></>,
    trash: <><path d="M4 7h16m-10 4v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3"/></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6"/></>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name] || shapes.grid}</svg>
}

export default function RestaurantPartnerWorkspacePage({ section: requestedSection }) {
  const section = requestedSection || window.location.pathname.split('/').filter(Boolean).pop() || 'menu'
  const session = readAuthSession()
  const [data, setData] = useState(null)
  const [records, setRecords] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [modal, setModal] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [draft, setDraft] = useState({})
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const title = sections[section]?.[0] || 'Restaurant workspace'
  const restaurantName = data?.restaurantName || data?.name || session?.user?.name || 'Your restaurant'
  const initials = restaurantName.split(/\s+/).map(part => part[0]?.toUpperCase()).slice(0, 2).join('') || 'R'

  const load = useCallback(async (signal) => {
    setLoading(true); setError('')
    try {
      const dashboard = await request('/dashboard?days=30', session?.accessToken, { signal })
      if (signal?.aborted) return
      setData(dashboard)
      let rows = []
      if (section === 'menu' || section === 'categories') rows = await request('/menu', session?.accessToken, { signal }) || []
      if (section === 'orders') rows = await request('/orders?days=90', session?.accessToken, { signal }) || []
      if (section === 'promotions') rows = await request('/promotions', session?.accessToken, { signal }) || []
      if (section === 'profile' || section === 'settings') setData(await request('/profile', session?.accessToken, { signal }))
      if (signal?.aborted) return
      setRecords(Array.isArray(rows) ? rows : [])
      if (section === 'categories') setCategories(await request('/menu/categories', session?.accessToken, { signal }) || [])
    } catch (e) { if (e.name !== 'AbortError' && !signal?.aborted) setError(e.message || 'This page could not be loaded.') }
    finally { if (!signal?.aborted) setLoading(false) }
  }, [section, session?.accessToken])

  useEffect(() => { const controller = new AbortController(); load(controller.signal); return () => controller.abort() }, [load])
  useEffect(() => { const key = e => { if (e.key === 'Escape') { setModal(null); setMobileOpen(false) } }; window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key) }, [])

  const visibleRecords = useMemo(() => records.filter(item => {
    const matches = !search || [item.name, item.slug, item.category, item.description, item.status, item.itemSummary, item.code].some(x => String(x || '').toLowerCase().includes(search.toLowerCase()))
    return matches && (filter === 'ALL' || (section === 'orders' ? item.status === filter : section === 'menu' ? (filter === 'AVAILABLE' ? item.available : !item.available) : item.status === filter))
  }), [records, search, filter, section])

  const openCreate = (type) => { setDraft(type === 'menu' ? { name: '', category: 'Main Course', description: '', price: '', imageUrl: '', available: true } : type === 'promotion' ? { name: '', description: '', discountType: 'PERCENTAGE', discountValue: '', minOrderAmount: '', status: 'DRAFT', desktopImageUrl: '', desktopPublicId: '' } : { ...(data || {}) }); setFile(null); setPreview(''); setModal(type) }
  const openEdit = (type, item) => { setDraft({ ...item, price: item.price ?? '', discountValue: item.discountValue ?? '' }); setFile(null); setPreview(''); setModal(type); }
  const setField = (name, value) => setDraft(current => ({ ...current, [name]: value }))
  const upload = async (target) => {
    if (!file) return draft[target === 'profile' ? 'imageUrl' : target === 'menu' ? 'imageUrl' : 'desktopImageUrl']
    const form = new FormData(); form.append('file', file)
    const result = await request(target === 'profile' ? '/profile/image' : target === 'menu' ? '/menu/image' : '/promotions/image', session?.accessToken, { method: 'POST', body: form })
    return result
  }

  const submit = async event => {
    event.preventDefault(); setSaving(true); setError(''); setNotice('')
    try {
      if (modal === 'menu') {
        const image = await upload('menu')
        const body = { ...draft, slug: draft.slug || slugify(draft.name), category: draft.category || 'Other', price: Number(draft.price), imageUrl: typeof image === 'string' ? image : image?.secureUrl || draft.imageUrl }
        await request(draft.id ? `/menu/${draft.id}` : '/menu', session?.accessToken, { method: draft.id ? 'PUT' : 'POST', body })
        setNotice(draft.id ? 'Menu item updated.' : 'Menu item added to your menu.')
      } else if (modal === 'profile') {
        const image = await upload('profile')
        const body = { name: draft.name, cuisine: draft.cuisine, description: draft.description, area: draft.area, deliveryTime: draft.deliveryTime, imageUrl: typeof image === 'string' ? image : image?.secureUrl || draft.imageUrl }
        const updated = await request('/profile', session?.accessToken, { method: 'PATCH', body })
        setData(updated); setNotice('Restaurant profile saved.')
      } else if (modal === 'promotion') {
        const uploaded = await upload('promotion')
        const imageUrl = typeof uploaded === 'string' ? uploaded : uploaded?.secureUrl || draft.desktopImageUrl || null
        const body = { ...draft, serviceType: 'FOOD', discountValue: Number(draft.discountValue), minOrderAmount: draft.minOrderAmount ? Number(draft.minOrderAmount) : null, desktopImageUrl: imageUrl, desktopPublicId: uploaded?.publicId || draft.desktopPublicId || null }
        await request(draft.id ? `/promotions/${draft.id}` : '/promotions', session?.accessToken, { method: draft.id ? 'PUT' : 'POST', body })
        setNotice(draft.id ? 'Promotion updated.' : 'Promotion saved as a draft.')
      }
      setModal(null); setFile(null); setPreview(''); await load(undefined)
    } catch (e) { setError(e.message || 'Could not save changes. Please try again.') }
    finally { setSaving(false) }
  }

  const updateOrder = async (id, status) => {
    try { setError(''); await request(`/orders/${id}/status`, session?.accessToken, { method: 'PATCH', body: { status } }); setNotice(`Order #${id} updated.`); await load(undefined) }
    catch (e) { setError(e.message || 'Order status could not be updated.') }
  }
  const toggleAvailability = async item => {
    try { await request(`/menu/${item.id}/availability?available=${!item.available}`, session?.accessToken, { method: 'PATCH' }); setNotice(`${item.name} is now ${item.available ? 'unavailable' : 'available'}.`); await load(undefined) }
    catch (e) { setError(e.message || 'Menu availability could not be changed.') }
  }
  const deleteItem = async item => {
    if (!window.confirm(`Remove “${item.name}” from your menu?`)) return
    try { await request(`/menu/${item.id}`, session?.accessToken, { method: 'DELETE' }); setNotice('Menu item removed.'); await load(undefined) }
    catch (e) { setError(e.message || 'Menu item could not be removed.') }
  }
  const updatePromoStatus = async (item, status) => {
    try { await request(`/promotions/${item.id}/status?status=${status}`, session?.accessToken, { method: 'PATCH' }); setNotice(`Promotion is now ${status.toLowerCase()}.`); await load(undefined) }
    catch (e) { setError(e.message || 'Promotion status could not be changed.') }
  }
  const deletePromo = async item => {
    if (!window.confirm(`Delete “${item.name}”?`)) return
    try { await request(`/promotions/${item.id}`, session?.accessToken, { method: 'DELETE' }); setNotice('Promotion deleted.'); await load(undefined) }
    catch (e) { setError(e.message || 'Promotion could not be deleted.') }
  }
  const onFile = event => { const picked = event.target.files?.[0]; if (!picked) return; setFile(picked); setPreview(URL.createObjectURL(picked)) }

  return <div className="rp-module-shell">
    {mobileOpen && <button className="rp-module-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)}/>}
    <header className="rp-module-top"><button className="rp-module-mobile" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Glyph name="menu"/></button><a href="/restaurant/dashboard" className="rp-module-logo"><img src="/D-Logo-transparent.png" alt=""/>Dorkar</a><span className="rp-module-role">Restaurant Partner</span><span className="rp-module-top-spacer"/><a href="/restaurant/profile" className="rp-module-avatar" aria-label="Restaurant profile">{data?.imageUrl ? <img src={data.imageUrl} alt=""/> : initials}</a></header>
    <aside className={`rp-module-sidebar ${mobileOpen ? 'open' : ''}`}><div className="rp-module-brand-row"><a href="/restaurant/dashboard" className="rp-module-logo"><img src="/D-Logo-transparent.png" alt=""/>Dorkar</a><button onClick={() => setMobileOpen(false)} aria-label="Close navigation"><Glyph name="close"/></button></div><div className="rp-module-store-card">{data?.imageUrl ? <img src={data.imageUrl} alt=""/> : <span className="rp-module-store-mark">{initials}</span>}<div><b>{restaurantName}</b><small>{data?.cuisine || 'Restaurant'}</small></div><span className={`rp-module-open ${data?.openForOrders ? 'on' : ''}`}><i/>{data?.openForOrders ? 'Open' : data?.applicationStatus === 'APPROVED' ? 'Closed' : 'Pending'}</span></div><nav className="rp-module-nav" aria-label="Restaurant partner pages">{navigation.map(([icon, label, href], i) => <a key={href} href={href} className={(section === 'dashboard' ? i === 0 : href === `/restaurant/${section}`) ? 'active' : ''} onClick={() => setMobileOpen(false)}><Glyph name={icon}/><span>{label}</span>{icon === 'bag' && data?.pendingOrders > 0 && <b>{data.pendingOrders}</b>}</a>)}</nav><div className="rp-module-support"><b>Need help?</b><p>Our partner team is here to help.</p><a href="/support">Contact support <Glyph name="arrow" size={14}/></a></div></aside>
    <main className="rp-module-main"><div className="rp-module-heading"><div><span className="rp-module-kicker">RESTAURANT PARTNER</span><h1>{title}</h1><p>{sections[section]?.[1]}</p></div>{['menu','promotions'].includes(section) && <button className="rp-module-primary" onClick={() => openCreate(section === 'menu' ? 'menu' : 'promotion')}><Glyph name="plus"/> {section === 'menu' ? 'Add menu item' : 'Create offer'}</button>}{section === 'orders' && <select aria-label="Filter order status" value={filter} onChange={e => setFilter(e.target.value)}><option value="ALL">All orders</option><option value="REQUESTED">New</option><option value="CONFIRMED">Accepted</option><option value="IN_PROGRESS">Preparing</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option></select>}</div>
      {error && <div className="rp-module-message error" role="alert">{error}<button onClick={() => setError('')} aria-label="Dismiss">×</button></div>}{notice && <div className="rp-module-message success" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss">×</button></div>}
      {loading ? <div className="rp-module-loading"><i/><i/><i/></div> : <>
        {section === 'menu' && <><div className="rp-module-toolbar"><label><Glyph name="grid"/><input placeholder="Search menu items" value={search} onChange={e => setSearch(e.target.value)}/></label><select aria-label="Filter item availability" value={filter} onChange={e => setFilter(e.target.value)}><option value="ALL">All availability</option><option value="AVAILABLE">Available</option><option value="UNAVAILABLE">Unavailable</option></select><span>{records.length} items</span></div><div className="rp-menu-grid">{visibleRecords.map(item => <article className="rp-menu-card" key={item.id}>{item.imageUrl ? <img className="rp-menu-photo" src={item.imageUrl} alt={item.name}/> : <div className="rp-menu-photo empty"><Glyph name="image" size={28}/><span>No food photo</span></div>}<div className="rp-menu-card-copy"><div><span className="rp-category-chip">{item.category || 'Uncategorized'}</span><span className={`rp-availability-chip ${item.available ? 'yes' : ''}`}>{item.available ? 'Available' : 'Hidden'}</span></div><h2>{item.name}</h2><p>{item.description || 'No description added.'}</p><footer><b>{money(item.price)}</b><button onClick={() => openEdit('menu', item)} aria-label={`Edit ${item.name}`}><Glyph name="edit"/></button><button onClick={() => toggleAvailability(item)}>{item.available ? 'Hide' : 'Publish'}</button><button className="danger" onClick={() => deleteItem(item)} aria-label={`Delete ${item.name}`}><Glyph name="trash"/></button></footer></div></article>)}{!visibleRecords.length && <Empty title="No menu items found" text={records.length ? 'Try another search or availability filter.' : 'Add your first item to start building your restaurant menu.'}/>}</div></>}
        {section === 'categories' && <><div className="rp-module-summary"><b>{categories.length}</b><span>menu categories</span><small>Categories are created automatically from the menu items you add.</small></div><div className="rp-category-grid">{categories.map(category => <a href={`/restaurant/menu?category=${encodeURIComponent(category.name)}`} key={category.name}><span><Glyph name="layers"/></span><div><b>{category.name}</b><small>{category.itemCount} {category.itemCount === 1 ? 'item' : 'items'}</small></div><Glyph name="arrow"/></a>)}{!categories.length && <Empty title="No categories yet" text="Choose a category when adding a menu item. It will appear here."/>}</div></>}
        {section === 'orders' && <div className="rp-module-table-wrap"><div className="rp-module-toolbar"><label><Glyph name="grid"/><input placeholder="Search orders or items" value={search} onChange={e => setSearch(e.target.value)}/></label><span>{visibleRecords.length} orders</span></div><table className="rp-module-table"><thead><tr><th>Order</th><th>Items</th><th>Amount</th><th>Time</th><th>Status</th><th>Update</th></tr></thead><tbody>{visibleRecords.map(order => <tr key={order.id}><td>#{order.id}</td><td>{order.itemSummary || 'Food order'}</td><td>{money(order.amount)}</td><td>{new Date(order.createdAt).toLocaleString('en-BD',{dateStyle:'medium',timeStyle:'short'})}</td><td><span className={`rp-status ${String(order.status).toLowerCase()}`}>{String(order.status).replaceAll('_',' ')}</span></td><td><select aria-label={`Update order ${order.id}`} value={order.status} onChange={e => updateOrder(order.id,e.target.value)}><option value={order.status}>{order.status}</option>{(order.status==='REQUESTED'?['CONFIRMED','CANCELLED']:order.status==='CONFIRMED'?['IN_PROGRESS','CANCELLED']:order.status==='IN_PROGRESS'?['COMPLETED']:[]).map(status=><option value={status} key={status}>{status.replaceAll('_',' ')}</option>)}</select></td></tr>)}</tbody></table>{!visibleRecords.length && <Empty title="No orders found" text="New customer orders will appear here."/>}</div>}
        {section === 'promotions' && <><div className="rp-module-toolbar"><label><Glyph name="grid"/><input placeholder="Search offers" value={search} onChange={e => setSearch(e.target.value)}/></label><span>{records.length} offers</span></div><div className="rp-promo-grid">{visibleRecords.map(item => <article className="rp-promo-card" key={item.id}>{item.desktopImageUrl ? <img src={item.desktopImageUrl} alt={item.name}/> : <div className="rp-promo-art"><Glyph name="tag" size={32}/><b>{item.discountType === 'PERCENTAGE' ? `${item.discountValue}% off` : money(item.discountValue)}</b></div>}<div><span className={`rp-status ${String(item.status).toLowerCase()}`}>{item.status}</span><h2>{item.name}</h2><p>{item.description || 'Food promotion'}</p><small>{item.startAt ? new Date(item.startAt).toLocaleDateString() : 'Start date not set'}{item.endAt ? ` — ${new Date(item.endAt).toLocaleDateString()}` : ''}</small><footer><button onClick={() => openEdit('promotion',item)}>Edit</button><select value={item.status} onChange={e => updatePromoStatus(item,e.target.value)} aria-label={`Change ${item.name} status`}>{['DRAFT','SCHEDULED','ACTIVE','PAUSED'].map(s=><option key={s}>{s}</option>)}</select><button className="danger" onClick={() => deletePromo(item)}>Delete</button></footer></div></article>)}{!visibleRecords.length && <Empty title="No promotions yet" text="Create a food offer and upload its image to get started."/>}</div></>}
        {section === 'profile' && <><ProfileForm data={data || {}} onSave={() => { setDraft({ ...data }); setModal('profile') }}/><div className="rp-module-tip">Restaurant profile changes update the listing shown to food customers.</div></>}
        {section === 'settings' && <div className="rp-settings-grid"><section className="rp-settings-card"><span><Glyph name="store"/></span><div><h2>Order availability</h2><p>Control whether customers can place new orders with your restaurant.</p></div><button className={`rp-module-toggle ${data?.openForOrders ? 'on' : ''}`} onClick={async()=>{try{const updated=await request(`/availability?open=${!data?.openForOrders}`,session?.accessToken,{method:'PATCH'});setData(updated);setNotice(updated.openForOrders?'Restaurant is open for orders.':'Restaurant is closed to orders.')}catch(e){setError(e.message)}}} disabled={data?.applicationStatus!=='APPROVED'}><i/>{data?.openForOrders?'Open':'Closed'}</button></section><section className="rp-settings-card"><span><Glyph name="clock"/></span><div><h2>Partner approval</h2><p>Account status: <b>{data?.applicationStatus || 'Unknown'}</b>. Only approved restaurants can accept orders.</p></div></section><a className="rp-settings-card" href="/change-password"><span><Glyph name="settings"/></span><div><h2>Password & account</h2><p>Update your sign-in password or review your account profile.</p></div><Glyph name="arrow"/></a></div>}
        {section === 'analytics' && <Analytics data={data}/>}
        {section === 'reviews' && <Unavailable title="Reviews are not available yet" text="Customer review records are not currently provided by the Dorkar backend. This page will show real reviews once that data source is connected." icon="star"/>}
        {section === 'payouts' && <Unavailable title="Payouts are not connected yet" text="The backend does not yet provide partner settlement or payout records. No estimated balance is shown here." icon="wallet"/>}
        {section === 'staff' && <Unavailable title="Staff access is not connected yet" text="Staff accounts and restaurant-level permissions are not yet supported by the backend. Your sign-in remains limited to this restaurant account." icon="users"/>}
      </>}
      <footer className="rp-module-footer">© {new Date().getFullYear()} Dorkar Restaurant Partner <a href="/support">Partner support</a></footer>
    </main>
    {modal && <div className="rp-modal-scrim" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget&&!saving){setModal(null);setPreview('');setFile(null)}}}><section className="rp-form-modal" role="dialog" aria-modal="true" aria-labelledby="rp-modal-title"><header><div><span>{modal === 'menu' ? 'MENU MANAGEMENT' : modal === 'promotion' ? 'FOOD PROMOTION' : 'RESTAURANT DETAILS'}</span><h2 id="rp-modal-title">{modal === 'menu' ? (draft.id ? 'Update menu item' : 'Add menu item') : modal === 'promotion' ? (draft.id ? 'Edit promotion' : 'Create food offer') : 'Edit restaurant profile'}</h2></div><button type="button" onClick={()=>setModal(null)} aria-label="Close dialog"><Glyph name="close"/></button></header><form onSubmit={submit}>
      {(modal==='menu'||modal==='promotion')&&<label className="rp-upload-control"><span className="rp-upload-preview">{preview||draft.imageUrl||draft.desktopImageUrl?<img src={preview||draft.imageUrl||draft.desktopImageUrl} alt="Preview"/>:<Glyph name="image" size={26}/>}</span><span><b>{modal==='menu'?'Food photo':'Promotion artwork'}</b><small>JPG, PNG or WebP · up to 8 MB</small><input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile}/></span></label>}
      {modal==='menu'&&<><div className="rp-form-two"><label>Item name<input required maxLength="140" value={draft.name||''} onChange={e=>setField('name',e.target.value)}/></label><label>Category<input required maxLength="80" list="rp-known-categories" value={draft.category||''} onChange={e=>setField('category',e.target.value)} placeholder="e.g. Main Course"/><datalist id="rp-known-categories">{categories.map(c=><option key={c.name} value={c.name}/>)}</datalist></label></div><label>Description<textarea maxLength="500" value={draft.description||''} onChange={e=>setField('description',e.target.value)} rows="3"/></label><div className="rp-form-two"><label>Price (BDT)<input required type="number" min="0.01" step="0.01" value={draft.price||''} onChange={e=>setField('price',e.target.value)}/></label><label className="rp-checkbox"><input type="checkbox" checked={Boolean(draft.available)} onChange={e=>setField('available',e.target.checked)}/> Available to order</label></div></>}
      {modal==='promotion'&&<><label>Offer title<input required maxLength="140" value={draft.name||''} onChange={e=>setField('name',e.target.value)}/></label><label>Description<textarea maxLength="500" value={draft.description||''} onChange={e=>setField('description',e.target.value)} rows="2"/></label><div className="rp-form-two"><label>Discount type<select value={draft.discountType||'PERCENTAGE'} onChange={e=>setField('discountType',e.target.value)}><option value="PERCENTAGE">Percentage</option><option value="FIXED">Fixed amount</option></select></label><label>Discount value<input required type="number" min="1" step="0.01" value={draft.discountValue||''} onChange={e=>setField('discountValue',e.target.value)}/></label></div><div className="rp-form-two"><label>Minimum order (optional)<input type="number" min="0" step="1" value={draft.minOrderAmount||''} onChange={e=>setField('minOrderAmount',e.target.value)}/></label><label>Publication status<select value={draft.status||'DRAFT'} onChange={e=>setField('status',e.target.value)}><option>DRAFT</option><option>ACTIVE</option><option>PAUSED</option></select></label></div><small className="rp-form-helper">Offers are saved for this restaurant and service. Use artwork that you have permission to publish.</small></>}
      {modal==='profile'&&<><div className="rp-profile-upload"><span>{preview||data?.imageUrl?<img src={preview||data?.imageUrl} alt="Restaurant profile preview"/>:<Glyph name="store" size={27}/>}</span><label>Restaurant profile photo<small>JPG, PNG, or WebP up to 8 MB</small><input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile}/></label></div><div className="rp-form-two"><label>Restaurant name<input required maxLength="140" value={draft.name||''} onChange={e=>setField('name',e.target.value)}/></label><label>Cuisine / category<input required maxLength="80" value={draft.cuisine||''} onChange={e=>setField('cuisine',e.target.value)}/></label></div><label>Description<textarea maxLength="500" value={draft.description||''} onChange={e=>setField('description',e.target.value)} rows="3"/></label><div className="rp-form-two"><label>Area<input required maxLength="140" value={draft.area||''} onChange={e=>setField('area',e.target.value)}/></label><label>Estimated delivery time<input required maxLength="40" value={draft.deliveryTime||''} onChange={e=>setField('deliveryTime',e.target.value)}/></label></div></>}
      <div className="rp-modal-actions"><button type="button" onClick={()=>setModal(null)} disabled={saving}>Cancel</button><button type="submit" disabled={saving}>{saving?'Saving…':modal==='menu'?(draft.id?'Save item':'Add item'):modal==='promotion'?(draft.id?'Save offer':'Create offer'):'Save profile'}</button></div>
    </form></section></div>}
  </div>
}

function Empty({ title, text }) { return <div className="rp-module-empty"><span><Glyph name="grid" size={23}/></span><b>{title}</b><p>{text}</p></div> }
function Unavailable({ title, text, icon }) { return <section className="rp-unavailable"><span><Glyph name={icon} size={25}/></span><h2>{title}</h2><p>{text}</p><a href="/restaurant/dashboard">Return to dashboard <Glyph name="arrow" size={15}/></a></section> }
function ProfileForm({ data, onSave }) {
  return <section className="rp-profile-card"><div className="rp-profile-image">{data.imageUrl?<img src={data.imageUrl} alt={`${data.name} profile`}/>:<span>{String(data.name||'R').slice(0,1).toUpperCase()}</span>}</div><div><h2>{data.name}</h2><p>{data.cuisine} · {data.area}</p><span className="rp-profile-summary">{data.description || 'Add a short description of your restaurant.'}</span></div><button className="rp-module-primary" onClick={onSave}><Glyph name="edit"/> Edit profile & photo</button><div className="rp-profile-details"><div><small>Restaurant name</small><b>{data.name || '—'}</b></div><div><small>Cuisine</small><b>{data.cuisine || '—'}</b></div><div><small>Service area</small><b>{data.area || '—'}</b></div><div><small>Delivery estimate</small><b>{data.deliveryTime || '—'}</b></div><div><small>Partner status</small><b>{data.applicationStatus || '—'}</b></div><div><small>Order status</small><b>{data.openForOrders ? 'Open' : 'Closed'}</b></div></div></section>
}
function Analytics({ data }) {
  const revenue = data?.revenue || []
  const max = Math.max(1, ...revenue.map(p=>Number(p.amount||0)))
  return <><div className="rp-analytics-kpis"><article><small>Total orders</small><b>{Number(data?.totalOrders||0).toLocaleString('en-BD')}</b><span>Last 30 days</span></article><article><small>Completed order revenue</small><b>{money(data?.grossRevenue)}</b><span>Completed orders only</span></article><article><small>Pending orders</small><b>{data?.pendingOrders||0}</b><span>Needs attention</span></article><article><small>Completed orders</small><b>{data?.completedOrders||0}</b><span>Last 30 days</span></article></div><section className="rp-analytics-chart"><h2>Completed order revenue</h2><p>Daily totals · Last 30 days</p>{revenue.length?<div className="rp-bars">{revenue.map(point=><div key={point.date} title={`${point.date}: ${money(point.amount)}`}><i style={{height:`${Math.max(2,Number(point.amount||0)/max*100)}%`}}/><small>{new Date(`${point.date}T00:00:00`).toLocaleDateString('en-BD',{day:'numeric',month:'short'})}</small></div>)}</div>:<Empty title="No revenue yet" text="Completed orders will appear in analytics."/>}</section><div className="rp-module-table-wrap"><h2>Top menu items</h2>{data?.popularItems?.length?<table className="rp-module-table"><thead><tr><th>Item</th><th>Orders</th><th>Price</th><th>Availability</th></tr></thead><tbody>{data.popularItems.map(i=><tr key={i.slug}><td>{i.name}</td><td>{i.orderCount}</td><td>{money(i.price)}</td><td>{i.available?'Available':'Unavailable'}</td></tr>)}</tbody></table>:<Empty title="No top items yet" text="Item performance appears after receiving orders."/>}</div></>
}
