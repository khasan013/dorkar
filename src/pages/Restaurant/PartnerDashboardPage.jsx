import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { readAuthSession, signOut } from '../../auth/session'
import partnerBanner from '../../assets/Dorkar-Restaurant-Partner-Banner.png'
import './PartnerDashboardPage.css'

const API = (import.meta.env.VITE_API_BASE_URL || 'https://dorker-backend.onrender.com').trim().replace(/\/$/, '')
const money = value => `৳ ${Number(value || 0).toLocaleString('en-BD', { maximumFractionDigits: 0 })}`
const shortDate = value => new Intl.DateTimeFormat('en-BD', { weekday: 'short', day: 'numeric' }).format(new Date(`${value}T00:00:00`))
const timeAgo = value => {
  if (!value || Number.isNaN(new Date(value).getTime())) return 'Recently'
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000))
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  return `${Math.floor(hours / 24)} days ago`
}
const statusName = value => ({ REQUESTED: 'New', CONFIRMED: 'Accepted', IN_PROGRESS: 'In progress', COMPLETED: 'Completed', CANCELLED: 'Cancelled' }[value] || value || 'Unknown')

async function partnerRequest(path, token, options = {}) {
  const response = await fetch(`${API}/api/v1/restaurant/partner${path}`, {
    method: options.method || 'GET',
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}`, ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    signal: options.signal,
  })
  const result = await response.json().catch(() => null)
  if (!response.ok || result?.success === false) {
    const error = new Error(result?.message || `Restaurant dashboard request failed (HTTP ${response.status})`)
    error.status = response.status
    throw error
  }
  return result?.data
}

function Icon({ name, size = 20 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    bag: <><path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></>,
    menu: <><path d="M4 5h16M4 12h16M4 19h16"/><circle cx="7" cy="5" r="1"/><circle cx="7" cy="12" r="1"/><circle cx="7" cy="19" r="1"/></>,
    tag: <><path d="m20 13-7 7L3 10V4h6l11 9Z"/><circle cx="7.5" cy="7.5" r="1"/></>,
    star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.4l6.1-.9L12 3Z"/>,
    chart: <><path d="M4 20V11m5 9V5m6 15v-7m5 7V3"/></>,
    wallet: <><rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 9h18m-5 5h2"/></>,
    store: <><path d="M4 10v10h16V10M3 4h18l-2 6H5L3 4Z"/><path d="M9 20v-6h6v6"/></>,
    users: <><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0m1-9a3 3 0 1 0-1-5.8M17 14a5 5 0 0 1 4 5"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19 13 2 1-2 4-2-1a8 8 0 0 1-3 1l-.5 2h-4L9 18a8 8 0 0 1-2-1l-2 1-2-4 2-1a7 7 0 0 1 0-2L3 10l2-4 2 1a8 8 0 0 1 2-1l.5-2h4l.5 2a8 8 0 0 1 2 1l2-1 2 4-2 1a7 7 0 0 1 0 2Z"/></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12h4"/></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6"/></>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.6 9a7 7 0 0 1 11.6-2L20 12M4 12l2.8 5a7 7 0 0 0 11.6-2"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    plus: <path d="M12 5v14m-7-7h14"/>,
    help: <><path d="M4 13v-2a8 8 0 0 1 16 0v2M4 13a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 2Zm16 0a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2Z"/><path d="M17 19c-1 1-3 1-5 1"/></>,
    closeSmall: <path d="m7 7 10 10M17 7 7 17"/>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.grid}</svg>
}

const navigation = [
  { key: 'dashboard', title: 'Dashboard', icon: 'grid', href: '/restaurant/dashboard' },
  { key: 'orders', title: 'Orders', icon: 'bag', href: '/restaurant/orders' },
  { key: 'menu', title: 'Menu / Items', icon: 'menu', href: '/restaurant/menu' },
  { key: 'categories', title: 'Categories', icon: 'layers', href: '/restaurant/categories' },
  { key: 'offers', title: 'Promotions & Offers', icon: 'tag', href: '/restaurant/promotions' },
  { key: 'reviews', title: 'Reviews', icon: 'star', href: '/restaurant/reviews' },
  { key: 'analytics', title: 'Analytics', icon: 'chart', href: '/restaurant/analytics' },
  { key: 'payouts', title: 'Payouts & Earnings', icon: 'wallet', href: '/restaurant/payouts' },
  { key: 'profile', title: 'Restaurant Profile', icon: 'store', href: '/restaurant/profile' },
  { key: 'staff', title: 'Staff & Access', icon: 'users', href: '/restaurant/staff' },
  { key: 'settings', title: 'Settings', icon: 'settings', href: '/restaurant/settings' },
]

export default function PartnerDashboardPage() {
  const session = readAuthSession()
  const [data, setData] = useState(null)
  const [days, setDays] = useState(7)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef(null)

  const loadDashboard = useCallback(async (signal, background = false) => {
    if (background) setRefreshing(true)
    else setLoading(true)
    setError('')
    try {
      const result = await partnerRequest(`/dashboard?days=${days}`, session?.accessToken, { signal })
      if (!signal?.aborted) setData(result)
    } catch (requestError) {
      if (requestError.name !== 'AbortError' && !signal?.aborted) setError(requestError.message || 'Restaurant dashboard could not be loaded.')
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
        setRefreshing(false)
      }
    }
  }, [days, session?.accessToken])

  useEffect(() => {
    const controller = new AbortController()
    loadDashboard(controller.signal)
    return () => controller.abort()
  }, [loadDashboard])

  useEffect(() => {
    const onPointerDown = event => { if (!accountRef.current?.contains(event.target)) setAccountOpen(false) }
    const onKeyDown = event => { if (event.key === 'Escape') { setAccountOpen(false); setMobileOpen(false) } }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('pointerdown', onPointerDown); document.removeEventListener('keydown', onKeyDown) }
  }, [])

  const orders = useMemo(() => {
    const query = search.trim().toLowerCase()
    return (data?.recentOrders || []).filter(order => {
      const matchesStatus = filter === 'ALL' || (filter === 'NEW' ? order.status === 'REQUESTED'
        : filter === 'IN_PROGRESS' ? ['CONFIRMED', 'IN_PROGRESS'].includes(order.status)
          : order.status === 'COMPLETED')
      return matchesStatus && (!query || `#ord-${order.id} ${order.itemSummary} ${statusName(order.status)}`.toLowerCase().includes(query))
    })
  }, [data?.recentOrders, filter, search])

  const updateAvailability = async () => {
    if (!data) return
    setRefreshing(true)
    setError('')
    setNotice('')
    try {
      const result = await partnerRequest(`/availability?open=${!data.openForOrders}`, session?.accessToken, { method: 'PATCH' })
      setData(result)
      setNotice(result.openForOrders ? 'Your restaurant is now open for orders.' : 'Your restaurant is now closed for orders.')
    } catch (requestError) { setError(requestError.message || 'Restaurant availability could not be changed.') }
    finally { setRefreshing(false) }
  }

  const changeOrderStatus = async (orderId, status) => {
    setError('')
    setNotice('')
    try {
      await partnerRequest(`/orders/${orderId}/status`, session?.accessToken, { method: 'PATCH', body: { status } })
      setNotice(`Order #${orderId} marked ${statusName(status).toLowerCase()}.`)
      await loadDashboard(undefined, true)
    } catch (requestError) { setError(requestError.message || 'Order could not be updated. Refresh and try again.') }
  }

  const restaurantName = data?.restaurantName || session?.user?.name || 'Your restaurant'
  const initials = restaurantName.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || 'R'
  const maxRevenue = Math.max(1, ...(data?.revenue || []).map(point => Number(point.amount || 0)))
  const chartPoints = (data?.revenue || []).map((point, index, all) => ({
    x: all.length <= 1 ? 50 : 9 + (index / (all.length - 1)) * 82,
    y: 92 - (Number(point.amount || 0) / maxRevenue) * 75,
  }))
  const chartLine = chartPoints.map(point => `${point.x},${point.y}`).join(' ')
  const chartArea = chartPoints.length ? `9,96 ${chartLine} 91,96` : ''
  const isApproved = data?.applicationStatus === 'APPROVED'

  return (
    <div className="restaurant-workspace" id="top">
      {mobileOpen && <button className="restaurant-drawer-scrim" type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)}/>}
      <header className="restaurant-topbar">
        <button className="restaurant-mobile-menu" type="button" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Icon name="menu"/></button>
        <a href="/" className="restaurant-brand"><img src="/D-Logo-transparent.png" alt=""/><span>Dorkar</span></a>
        <span className="restaurant-partner-pill">Restaurant Partner</span>
        <label className="restaurant-global-search"><Icon name="search" size={18}/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search orders, items, or customers…" aria-label="Search orders and items"/></label>
        <button className="restaurant-icon-button" type="button" aria-label="Notifications" onClick={() => setNotice('You’re all caught up.') }><Icon name="bell"/><i/></button>
        <div className="restaurant-account-wrap" ref={accountRef}>
          <button className="restaurant-account-trigger" type="button" aria-expanded={accountOpen} onClick={() => setAccountOpen(open => !open)}>
            <span className="restaurant-avatar">{initials}</span><span className="restaurant-account-label"><b>{restaurantName}</b><small>Restaurant Admin</small></span><span className="restaurant-chevron">⌄</span>
          </button>
          {accountOpen && <div className="restaurant-account-menu"><b>{restaurantName}</b><small>{session?.user?.email || session?.user?.phone}</small><a href="/restaurant/dashboard">Restaurant dashboard</a><a href="/restaurant/profile">Restaurant profile</a><button type="button" onClick={signOut}>Sign out</button></div>}
        </div>
      </header>

      <aside className={`restaurant-sidebar ${mobileOpen ? 'is-open' : ''}`}>
        <div className="restaurant-sidebar-top"><a href="/" className="restaurant-brand"><img src="/D-Logo-transparent.png" alt=""/><span>Dorkar</span></a><button type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><Icon name="close"/></button></div>
        <section className="restaurant-identity-card">
          {data?.imageUrl ? <img src={data.imageUrl} alt=""/> : <span className="restaurant-identity-fallback"><Icon name="store" size={25}/></span>}
          <div className="restaurant-identity-copy"><b>{restaurantName}</b><small>{data?.cuisine || 'Restaurant'}</small></div>
          <span className={`restaurant-verified ${isApproved ? 'approved' : 'pending'}`} title={isApproved ? 'Verified by Dorkar' : 'Pending verification'}>{isApproved ? '✓' : '•'}</span>
          <span className={`restaurant-open-badge ${!isApproved ? 'pending' : data?.openForOrders ? 'open' : 'closed'}`}><i/>{isApproved ? (data?.openForOrders ? 'Open' : 'Closed') : 'Pending review'}</span>
        </section>
        <nav className="restaurant-nav" aria-label="Restaurant navigation">
          {navigation.map((item, index) => <a key={item.key} className={index === 0 ? 'active' : ''} href={item.href} onClick={() => setMobileOpen(false)}><Icon name={item.icon} size={18}/><span>{item.title}</span>{item.key === 'orders' && data?.pendingOrders > 0 && <b>{data.pendingOrders}</b>}</a>)}
        </nav>
        <section className="restaurant-help-card"><span><Icon name="help" size={21}/></span><div><b>Need help?</b><p>Our partner support team is here for you.</p></div><a href="/support">Contact Dorkar Support <Icon name="arrow" size={15}/></a></section>
        <div className="restaurant-sidebar-foot"><span className={isApproved ? 'online' : 'waiting'}/>{isApproved ? 'Partner workspace' : 'Verification in progress'}<b>{isApproved ? 'Active' : 'Pending'}</b></div>
      </aside>

      <main className="restaurant-main">
        <div className="restaurant-page-heading">
          <div><span className="restaurant-eyebrow"><i/>RESTAURANT OVERVIEW</span><h1>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {restaurantName}! <span aria-hidden="true">👋</span></h1><p>Here’s what’s happening at your restaurant today.</p></div>
          <div className="restaurant-heading-actions">
            <button className={`restaurant-availability ${data?.openForOrders ? 'is-open' : ''}`} type="button" onClick={updateAvailability} disabled={!isApproved || loading || refreshing} aria-pressed={Boolean(data?.openForOrders)}><i/>{isApproved ? (data?.openForOrders ? 'Open for Orders' : 'Closed to Orders') : 'Awaiting Approval'}</button>
            <label className="restaurant-range"><Icon name="clock" size={18}/><select value={days} onChange={event => setDays(Number(event.target.value))} aria-label="Reporting period"><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select></label>
          </div>
        </div>

        {error && <div className="restaurant-feedback error" role="alert"><span>!</span><p>{error}</p><button type="button" onClick={() => loadDashboard(undefined, true)}><Icon name="refresh" size={15}/> Retry</button></div>}
        {notice && <div className="restaurant-feedback success" role="status"><Icon name="check" size={16}/><p>{notice}</p><button type="button" aria-label="Dismiss message" onClick={() => setNotice('')}><Icon name="closeSmall" size={16}/></button></div>}

        <section className="restaurant-kpis" aria-label="Restaurant performance">
          <KpiCard icon="bag" label="Total Orders" value={data?.totalOrders} tone="red" loading={loading} note={`Last ${days} days`}/>
          <KpiCard icon="layers" label="Gross Revenue" value={data ? money(data.grossRevenue) : null} tone="green" loading={loading} note="Completed orders only"/>
          <KpiCard icon="clock" label="Pending Orders" value={data?.pendingOrders} tone="amber" loading={loading} note="Needs your attention"/>
          <KpiCard icon="check" label="Completed Orders" value={data?.completedOrders} tone="green" loading={loading} note={`Last ${days} days`}/>
        </section>

        {!loading && data?.applicationStatus !== 'APPROVED' && <section className="restaurant-review-banner"><span className="restaurant-review-icon"><Icon name="clock"/></span><div><b>Your partner profile is under review</b><p>You can explore this workspace while Dorkar verifies your restaurant. Order acceptance will be enabled after approval.</p></div><span className="restaurant-review-status">{statusName(data?.applicationStatus)}</span></section>}

        <div className="restaurant-overview-grid">
          <section className="restaurant-panel restaurant-orders-panel" id="orders">
            <PanelHeading icon="bag" title="Orders Overview" subtitle="Recent orders for your restaurant" action={<a href="/restaurant/orders">View all <Icon name="arrow" size={15}/></a>}/>
            <div className="restaurant-order-tools"><div className="restaurant-order-tabs" role="tablist" aria-label="Filter orders">{[['ALL','All'],['NEW','New'],['IN_PROGRESS','In progress'],['COMPLETED','Completed']].map(([key,label])=><button type="button" role="tab" aria-selected={filter===key} className={filter===key?'active':''} key={key} onClick={() => setFilter(key)}>{label}{key==='NEW' && data?.pendingOrders>0 && <span>{data.pendingOrders}</span>}</button>)}</div><button className="restaurant-refresh" type="button" onClick={() => loadDashboard(undefined,true)} disabled={refreshing} aria-label="Refresh orders"><Icon name="refresh" size={16}/></button></div>
            <div className="restaurant-order-list" id="orders-list">
              {loading ? <ListLoading/> : orders.length ? orders.map(order => <OrderRow key={order.id} order={order} disabled={!isApproved} onUpdate={changeOrderStatus}/>) : <EmptyState icon="bag" title={filter==='ALL'?'No orders yet':'No orders in this status'} text={filter==='ALL'?'New orders will appear here as customers place them.':'Try another order filter.'}/>}
            </div>
          </section>

          <section className="restaurant-panel restaurant-revenue-panel" id="revenue">
            <PanelHeading icon="chart" title="Revenue Analytics" subtitle={`Completed order revenue · ${days} days`} action={<span className="restaurant-data-label">BDT</span>}/>
            <div className="restaurant-revenue-total">{loading ? '—' : money(data?.grossRevenue)} <span>Gross revenue</span></div>
            <div className="restaurant-chart-wrap">
              {loading ? <div className="restaurant-chart-skeleton"/> : data?.revenue?.length ? <>
                <div className="restaurant-chart-axis"><span>{money(maxRevenue)}</span><span>{money(maxRevenue/2)}</span><span>৳ 0</span></div>
                <svg className="restaurant-revenue-chart" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={`Revenue for the last ${days} days`}>
                  <defs><linearGradient id="restaurant-revenue-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#ef233c" stopOpacity=".2"/><stop offset="100%" stopColor="#ef233c" stopOpacity="0"/></linearGradient></defs>
                  {[18,43,68,94].map(y=><line key={y} x1="8" x2="92" y1={y} y2={y} className="restaurant-chart-gridline"/>)}
                  {chartArea && <polygon points={chartArea} fill="url(#restaurant-revenue-fill)"/>}
                  {chartLine && <polyline points={chartLine} fill="none" stroke="#ef233c" strokeWidth="1.8" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round"/>}
                  {chartPoints.length>0 && <circle cx={chartPoints.at(-1).x} cy={chartPoints.at(-1).y} r="2.8" fill="#ef233c" stroke="white" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>}
                </svg>
                <div className="restaurant-chart-dates">{data.revenue.map((point,index)=> <span key={point.date} className={(days>7 && index%Math.ceil(days/7)!==0 && index!==data.revenue.length-1)?'muted':''}>{shortDate(point.date)}</span>)}</div>
              </> : <EmptyState icon="chart" title="No revenue recorded" text="Completed orders will appear in this chart."/>}
            </div>
          </section>
        </div>

        <div className="restaurant-lower-grid">
          <section className="restaurant-panel restaurant-menu-panel" id="menu-performance">
            <PanelHeading icon="menu" title="Menu Performance" subtitle="Items ordered during the selected period" action={<a href="/restaurant/menu">Menu items <Icon name="arrow" size={15}/></a>}/>
            {loading ? <ListLoading/> : data?.popularItems?.length ? <div className="restaurant-item-list">{data.popularItems.map((item,index)=><article key={item.slug}><span className="restaurant-item-rank">{index+1}</span>{item.imageUrl ? <img src={item.imageUrl} alt=""/> : <span className="restaurant-item-image"><Icon name="menu" size={19}/></span>}<div className="restaurant-item-name"><b>{item.name}</b><small>{item.orderCount} {item.orderCount===1?'order':'orders'} in this period</small></div><strong>{money(item.price)}</strong><span className="restaurant-item-availability"><i className={item.available?'available':'unavailable'}/>{item.available?'Available':'Unavailable'}</span></article>)}</div> : <EmptyState icon="menu" title="Menu insights will appear here" text="Once your menu receives orders, you’ll see item performance here."/>}
            <div className="restaurant-menu-summary"><span>{loading?'—':data?.menuItemCount ?? 0} menu items</span><span>{loading?'—':data?.availableItemCount ?? 0} available</span></div>
          </section>

          <section className="restaurant-panel restaurant-quick-panel" id="quick-actions">
            <PanelHeading icon="plus" title="Quick Actions" subtitle="Shortcuts for your restaurant"/>
            <div className="restaurant-quick-grid"><a href="/restaurant/menu" className="tint-red"><Icon name="plus" size={23}/><b>Manage menu</b><small>Add and update items</small></a><a href="/restaurant/orders" className="tint-blue"><Icon name="bag" size={23}/><b>View orders</b><small>See incoming orders</small></a><a href="/restaurant/profile" className="tint-purple"><Icon name="store" size={23}/><b>Update profile</b><small>Restaurant details</small></a><a href="/restaurant/promotions" className="tint-green"><Icon name="tag" size={23}/><b>Create offer</b><small>Promote your food</small></a></div>
          </section>

          <section className="restaurant-promo-panel">
            <img src={partnerBanner} alt="Restaurant partners growing with Dorkar"/>
            <div className="restaurant-promo-copy"><span>GROW WITH DORKAR</span><h2>More ways to grow your restaurant</h2><p>Keep your menu current and give customers a great experience.</p><a href="/restaurant/promotions">Manage food offers <Icon name="arrow" size={15}/></a></div>
          </section>
        </div>
        <footer className="restaurant-page-footer"><span>© {new Date().getFullYear()} Dorkar Restaurant Partner</span><a href="/terms">Partner terms</a><a href="/support">Support</a></footer>
      </main>
    </div>
  )
}

function KpiCard({ icon, label, value, tone, loading, note }) {
  return <article className={`restaurant-kpi ${tone}`}><span className="restaurant-kpi-icon"><Icon name={icon} size={21}/></span><div><small>{label}</small><b>{loading ? <i className="restaurant-value-skeleton"/> : value?.toLocaleString?.('en-BD') ?? value ?? '—'}</b><span>{note}</span></div><span className="restaurant-kpi-watermark"><Icon name={icon} size={54}/></span></article>
}

function PanelHeading({ icon, title, subtitle, action }) {
  return <header className="restaurant-panel-heading"><div><span><Icon name={icon} size={17}/></span><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div></div>{action && <div className="restaurant-panel-action">{action}</div>}</header>
}

function OrderRow({ order, disabled, onUpdate }) {
  const next = order.status === 'REQUESTED' ? [['CONFIRMED','Accept'],['CANCELLED','Reject']] : order.status === 'CONFIRMED' ? [['IN_PROGRESS','Start preparing']] : order.status === 'IN_PROGRESS' ? [['COMPLETED','Mark completed']] : []
  return <article className="restaurant-order-row"><span className={`restaurant-order-icon ${String(order.status).toLowerCase()}`}><Icon name={order.status==='COMPLETED'?'check':order.status==='REQUESTED'?'bag':'clock'} size={18}/></span><div className="restaurant-order-main"><div><b>#{order.id}</b><span className={`restaurant-order-status ${String(order.status).toLowerCase()}`}>{statusName(order.status)}</span></div><p>{order.itemSummary || 'Food order'}</p><small>{timeAgo(order.createdAt)}</small></div><div className="restaurant-order-total"><b>{money(order.amount)}</b><small>Order total</small></div><div className="restaurant-order-actions">{next.map(([status,label])=><button key={status} className={status==='CANCELLED'?'reject':status==='CONFIRMED'?'accept':''} type="button" onClick={()=>onUpdate(order.id,status)} disabled={disabled} aria-label={`${label} order ${order.id}`}>{label}</button>)}</div></article>
}

function EmptyState({ icon, title, text }) {
  return <div className="restaurant-empty-state"><span><Icon name={icon} size={22}/></span><b>{title}</b><p>{text}</p></div>
}

function ListLoading() {
  return <div className="restaurant-loading-list" aria-label="Loading"><i/><i/><i/></div>
}
