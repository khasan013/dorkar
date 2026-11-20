import { useEffect, useMemo, useState } from 'react'
import dorkarLogo from '../../assets/D-Logo-transparent.png'
import { readAuthSession, signOut } from '../../auth/session'
import { getAdminDashboard, getAdminPartners, getAdminRequests, getAdminTickets } from '../../services/adminApi'
import './DashboardPage.css'

const serviceConfig = {
  RIDE: { label: 'Ride Sharing', short: 'Ride', color: '#2388f5', icon: 'car' },
  FOOD: { label: 'Food Delivery', short: 'Food', color: '#ff941f', icon: 'food' },
  PARCEL: { label: 'Parcel Delivery', short: 'Parcel', color: '#a338f5', icon: 'box' },
  BLOOD_DONATION: { label: 'Blood Donation', short: 'Blood', color: '#ef233c', icon: 'blood' },
}

const menuGroups = [
  { title: 'Platform management', items: [['users', 'Users & Customers'], ['drivers', 'Drivers & Delivery'], ['rides', 'Ride Management'], ['food', 'Food Management'], ['parcels', 'Parcel Management'], ['blood', 'Blood Donation']] },
  { title: 'Operations', items: [['orders', 'Orders & Bookings'], ['payments', 'Payments & Transactions'], ['promotions', 'Promotions & Coupons'], ['support', 'Support & Complaints']] },
  { title: 'Analytics & settings', items: [['reports', 'Reports & Analytics'], ['settings', 'Settings'], ['access', 'Admin Role & Access'], ['logs', 'System Logs']] },
]

function Icon({ name, size = 20 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    users: <><path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20"/><circle cx="9.5" cy="7" r="3.5"/><path d="M17 11a3.5 3.5 0 1 0-1-6.8M21 20v-1.5a4 4 0 0 0-2.8-3.8"/></>,
    driver: <><circle cx="12" cy="7" r="4"/><path d="M4 21a8 8 0 0 1 16 0M8 11l-2 3 2 2m8-5 2 3-2 2"/></>,
    car: <><path d="m5 11 1.7-4.2A2 2 0 0 1 8.6 5h6.8a2 2 0 0 1 1.9 1.8L19 11"/><path d="M3 11h18v7H3zM6 18v2m12-2v2"/><path d="M6 14h2m8 0h2"/></>,
    food: <><path d="M4 3v7a3 3 0 0 0 6 0V3M7 3v18M17 3v18M17 3c3 2 3 7 0 9"/></>,
    box: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="M3 8v9l9 5 9-5V8M12 13v9M7.5 5.5l9 5"/></>,
    blood: <><path d="M12 3S5 11 5 15.2a7 7 0 0 0 14 0C19 11 12 3 12 3Z"/><path d="M9 15h6m-3-3v6"/></>,
    clipboard: <><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M8 10h8m-8 4h8m-8 4h5"/></>,
    card: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18m-14 5h4"/></>,
    tag: <><path d="m20 13-7 7L3 10V4h6l11 9Z"/><circle cx="7.5" cy="7.5" r="1"/></>,
    help: <><path d="M4 13v-2a8 8 0 0 1 16 0v2M4 13a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 2Zm16 0a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2Zm-3 5a5 5 0 0 1-5 3h-1"/></>,
    chart: <><path d="M4 20V11m5 9V5m6 15v-7m5 7V3"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.8 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.8-1l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2L5.7 12l1.4-2.4 1.7.7a8 8 0 0 1 1.8-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.8 1l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1-.1 1.9Z"/></>,
    shield: <><path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z"/><path d="m9 12 2 2 4-4"/></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12h4"/></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.5 9a7 7 0 0 1 12-2L20 12m-16 0 2.5 5a7 7 0 0 0 12-2"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6"/></>,
    plus: <><path d="M12 5v14m-7-7h14"/></>,
    dots: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
    spark: <><path d="m12 3 1.5 6 6.5 3-6.5 2-1.5 7-2-7-6-2 6-3 2-6Z"/></>,
  }
  return <svg {...common}>{paths[name] || paths.grid}</svg>
}

function formatCount(value) {
  return typeof value === 'number' ? new Intl.NumberFormat('en-BD').format(value) : '—'
}

function formatMoney(value) {
  if (value == null || value === '') return '—'
  const amount = Number(value)
  return Number.isFinite(amount) ? `৳${new Intl.NumberFormat('en-BD', { maximumFractionDigits: 0 }).format(amount)}` : '—'
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-BD', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(date)
}

function getAdminName(user) {
  return user?.name?.trim() || 'Administrator'
}

function Logo() {
  return <a className="admin-brand" href="/" aria-label="Dorkar home"><img src={dorkarLogo} alt=""/><span>Dorkar</span></a>
}

function AdminDashboardPage() {
  const session = readAuthSession()
  const adminName = getAdminName(session?.user)
  const initials = adminName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [dashboard, setDashboard] = useState(null)
  const [requests, setRequests] = useState([])
  const [partners, setPartners] = useState([])
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadData = async ({ quiet = false } = {}) => {
    if (!session?.accessToken) return
    if (quiet) setRefreshing(true)
    else setLoading(true)
    setError('')
    try {
      const controller = new AbortController()
      const [overview, requestResult, partnerResult, ticketResult] = await Promise.allSettled([
        getAdminDashboard(session.accessToken, controller.signal),
        getAdminRequests(session.accessToken, controller.signal),
        getAdminPartners(session.accessToken, controller.signal),
        getAdminTickets(session.accessToken, controller.signal),
      ])

      if (overview.status === 'rejected') throw overview.reason
      setDashboard(overview.value || {})
      setRequests(requestResult.status === 'fulfilled' && Array.isArray(requestResult.value) ? requestResult.value : [])
      setPartners(partnerResult.status === 'fulfilled' && Array.isArray(partnerResult.value) ? partnerResult.value : [])
      setTickets(ticketResult.status === 'fulfilled' && Array.isArray(ticketResult.value) ? ticketResult.value : [])
      const optionalErrors = [requestResult, partnerResult, ticketResult].filter((result) => result.status === 'rejected')
      if (optionalErrors.length) setError('Some dashboard panels could not load. The available totals are still shown.')
    } catch (requestError) {
      if (requestError?.status === 401) {
        signOut()
        return
      }
      if (requestError?.status === 403) {
        setError('Your account does not have administrator access.')
      } else {
        setError(requestError?.message || 'Could not load the admin dashboard. Check your connection and retry.')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
    // Auth token is stable for the lifetime of the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const requestCounts = useMemo(() => {
    const counts = Object.fromEntries(Object.keys(serviceConfig).map((key) => [key, 0]))
    requests.forEach((request) => {
      const type = String(request?.serviceType || '').toUpperCase()
      if (Object.hasOwn(counts, type)) counts[type] += 1
    })
    return counts
  }, [requests])

  const recentRequests = useMemo(() => [...requests]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5), [requests])

  const pendingPartners = partners.filter((partner) => String(partner?.status || '').toUpperCase() === 'PENDING').length
  const openTickets = tickets.filter((ticket) => !['CLOSED', 'RESOLVED'].includes(String(ticket?.status || '').toUpperCase())).length
  const activeSection = window.location.pathname.split('/')[2] || 'dashboard'
  const activeLabel = menuGroups.flatMap((group) => group.items).find(([id]) => id === activeSection)?.[1]
  const sectionTitle = activeSection === 'dashboard' ? 'Admin Dashboard' : activeLabel || 'Admin Dashboard'
  const searchQuery = search.trim().toLowerCase()
  const searchMatches = searchQuery
    ? recentRequests.filter((request) => `${request.id} ${request.serviceType} ${request.status}`.toLowerCase().includes(searchQuery))
    : []

  const metrics = [
    { title: 'Total users', value: dashboard?.users, caption: 'Registered accounts', color: 'blue', icon: 'users' },
    { title: 'Service requests', value: dashboard?.serviceRequests, caption: 'Across all services', color: 'purple', icon: 'clipboard' },
    { title: 'Partner applications', value: dashboard?.partners, caption: pendingPartners > 0 ? `${formatCount(pendingPartners)} pending review` : 'All applications', color: 'orange', icon: 'driver' },
    { title: 'Support tickets', value: dashboard?.supportTickets, caption: openTickets > 0 ? `${formatCount(openTickets)} open cases` : 'All support cases', color: 'red', icon: 'help' },
  ]

  const requestTotal = Object.values(requestCounts).reduce((sum, value) => sum + value, 0)
  const chartSegments = Object.entries(requestCounts).map(([key, value]) => ({ ...serviceConfig[key], value }))
  let segmentStart = 0
  const ringGradient = requestTotal > 0
    ? `conic-gradient(${chartSegments.map((segment) => {
      const start = segmentStart
      segmentStart += (segment.value / requestTotal) * 100
      return `${segment.color} ${start}% ${segmentStart}%`
    }).join(', ')})`
    : 'conic-gradient(#edf0f5 0 100%)'

  return (
    <div className="admin-app-shell">
      <header className="admin-topbar">
        <div className="admin-topbar-brand"><Logo/><span className="admin-panel-badge">Admin Panel</span></div>
        <nav className="admin-top-links" aria-label="Service shortcuts">
          <a href="/">Home</a><a href="/ride">Ride</a><a href="/food">Food</a><a href="/parcel">Parcel</a><a href="/blood">Blood Donation</a>
        </nav>
        <div className="admin-top-actions">
          <label className="admin-search"><Icon name="search" size={18}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search requests..." aria-label="Search recent service requests"/>{search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search"><Icon name="close" size={15}/></button>}</label>
          {searchQuery && <div className="admin-search-results" role="status">{searchMatches.length ? `${searchMatches.length} recent request${searchMatches.length === 1 ? '' : 's'} match` : 'Search recent requests by reference, service, or status.'}</div>}
          <div className="admin-popover-wrap">
            <button className="admin-icon-button has-dot" type="button" aria-label="Notifications" onClick={() => setNotificationOpen(!notificationOpen)}><Icon name="bell"/></button>
            {notificationOpen && <div className="admin-popover"><b>Admin notifications</b><p>{pendingPartners + openTickets ? `${formatCount(pendingPartners + openTickets)} items need attention.` : 'No urgent items are waiting.'}</p><a href="#approvals" onClick={() => setNotificationOpen(false)}>Review dashboard</a></div>}
          </div>
          <div className="admin-popover-wrap">
            <button className="admin-profile-button" type="button" onClick={() => setProfileOpen(!profileOpen)} aria-expanded={profileOpen}><span className="admin-avatar">{initials}</span><span className="admin-profile-copy"><b>{adminName}</b><small>{session?.user?.role || 'Admin'}</small></span><span className="admin-chevron">⌄</span></button>
            {profileOpen && <div className="admin-popover admin-account-popover"><b>{adminName}</b><small>{session?.user?.email || session?.user?.phone || ''}</small><button type="button" onClick={signOut}>Sign out</button></div>}
          </div>
          <button className="admin-mobile-menu" type="button" aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMobileNavOpen(!mobileNavOpen)}><Icon name={mobileNavOpen ? 'close' : 'menu'}/></button>
        </div>
      </header>

      <div className="admin-workspace">
        <button className={`admin-sidebar-scrim ${mobileNavOpen ? 'is-visible' : ''}`} aria-label="Close navigation" onClick={() => setMobileNavOpen(false)}/>
        <aside className={`admin-sidebar ${mobileNavOpen ? 'is-open' : ''}`} aria-label="Admin navigation">
          <a className={`admin-menu-link ${activeSection === 'dashboard' ? 'is-active' : ''}`} href="/admin"><Icon name="grid"/><span>Dashboard</span></a>
          {menuGroups.map((group) => <div className="admin-menu-group" key={group.title}><h2>{group.title}</h2>{group.items.map(([id, label]) => <a className={`admin-menu-link ${activeSection === id ? 'is-active' : ''}`} href={`/admin/${id}`} key={id} onClick={() => setMobileNavOpen(false)}><Icon name={id === 'users' ? 'users' : id === 'drivers' ? 'driver' : id === 'rides' ? 'car' : id === 'food' ? 'food' : id === 'parcels' ? 'box' : id === 'blood' ? 'blood' : id === 'orders' ? 'clipboard' : id === 'payments' ? 'card' : id === 'promotions' ? 'tag' : id === 'support' ? 'help' : id === 'reports' ? 'chart' : id === 'settings' ? 'settings' : id === 'access' ? 'shield' : 'clipboard'}/><span>{label}</span></a>)}</div>)}
          <div className="admin-sidebar-foot"><span className="admin-status-dot"/><span>Platform status</span><b>Operational</b></div>
        </aside>

        <main className="admin-main">
          <div className="admin-page-heading">
            <div><div className="admin-heading-kicker"><span className="admin-live-dot"/>Live platform overview</div><h1>{sectionTitle}</h1><p>Welcome back, {adminName.split(' ')[0]}. Here’s the latest from Dorkar.</p></div>
            <div className="admin-heading-actions"><span className="admin-date-range"><Icon name="calendar" size={17}/>All-time totals</span><button className="admin-refresh-button" type="button" onClick={() => loadData({ quiet: true })} disabled={refreshing}><Icon name="refresh" size={17}/>{refreshing ? 'Refreshing' : 'Refresh'}</button></div>
          </div>

          {error && <div className={`admin-inline-alert ${error.includes('administrator') ? 'is-error' : ''}`} role="status"><Icon name={error.includes('administrator') ? 'shield' : 'help'} size={18}/><span>{error}</span><button type="button" onClick={() => loadData({ quiet: true })}>Retry</button></div>}

          {activeSection !== 'dashboard' && <div className="admin-module-notice"><span className="admin-module-icon"><Icon name="settings" size={23}/></span><div><b>{sectionTitle}</b><p>This management screen is not included in the current admin API yet. Your dashboard and supported live summaries are available here.</p><a href="/admin">Return to dashboard <Icon name="arrow" size={16}/></a></div></div>}

          <div className="admin-dashboard-grid">
            <section className="admin-metric-grid" aria-label="Platform totals">
              {metrics.map((metric) => <article className={`admin-metric-card ${metric.color}`} key={metric.title}><div className="admin-metric-icon"><Icon name={metric.icon} size={23}/></div><div className="admin-metric-data"><span>{metric.title}</span><strong>{loading ? <i className="admin-skeleton"/> : formatCount(metric.value)}</strong><small>{metric.caption}</small></div><span className="admin-metric-watermark"><Icon name={metric.icon} size={64}/></span></article>)}
            </section>

            <section className="admin-panel admin-quick-panel" aria-labelledby="quick-actions-title"><div className="admin-panel-heading"><h2 id="quick-actions-title">Quick actions</h2><span className="admin-kicker-icon"><Icon name="spark" size={17}/></span></div><div className="admin-quick-grid"><a href="#recent-requests"><span><Icon name="clipboard"/></span><b>Review requests</b></a><a href="#approvals"><span><Icon name="driver"/></span><b>Partner approvals</b></a><a href="#support-cases"><span><Icon name="bell"/></span><b>Support cases</b></a><button type="button" onClick={() => loadData({ quiet: true })}><span><Icon name="refresh"/></span><b>Refresh data</b></button></div></section>

            <section className="admin-panel admin-revenue-panel"><div className="admin-panel-heading"><div><h2>Revenue overview</h2><p>Historical revenue reporting</p></div><span className="admin-unavailable-pill">API unavailable</span></div><div className="admin-chart-empty"><div className="admin-chart-watermark"><Icon name="chart" size={30}/></div><b>Revenue analytics aren’t available yet</b><p>The current admin API doesn’t return revenue totals or date-based history. No sample figures are shown.</p></div></section>

            <section className="admin-panel admin-service-panel" id="service-breakdown"><div className="admin-panel-heading"><div><h2>Requests by service</h2><p>Live breakdown from service requests</p></div><span className="admin-small-tag">{loading ? '…' : `${formatCount(requestTotal)} total`}</span></div><div className="admin-service-chart-row"><div className="admin-donut" style={{ '--admin-donut': ringGradient }}><span><b>{loading ? '…' : formatCount(requestTotal)}</b><small>requests</small></span></div><div className="admin-service-legend">{Object.entries(serviceConfig).map(([key, service]) => <div className="admin-legend-row" key={key}><i style={{ '--service-color': service.color }}/><span>{service.label}</span><b>{loading ? '—' : formatCount(requestCounts[key])}</b></div>)}</div></div>{!loading && requests.length === 0 && <p className="admin-data-note">No service request records were returned.</p>}</section>

            <section className="admin-service-summary" aria-label="Service performance">
              {Object.entries(serviceConfig).map(([key, service]) => <article className="admin-service-card" key={key} style={{ '--service-color': service.color }}><span className="admin-service-icon"><Icon name={service.icon}/></span><div><b>{service.label}</b><small>{loading ? 'Loading activity…' : `${formatCount(requestCounts[key])} requests`}</small></div><a href="#service-breakdown" aria-label={`View ${service.label} summary`}><Icon name="arrow" size={17}/></a></article>)}
            </section>

            <section className="admin-panel admin-recent-panel" id="recent-requests"><div className="admin-panel-heading"><div><h2>Recent service requests</h2><p>Latest activity across Dorkar services</p></div><a href="/admin/orders">View all <Icon name="arrow" size={16}/></a></div>{loading ? <div className="admin-table-loading"><i/><i/><i/></div> : recentRequests.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Reference</th><th>Service</th><th>Amount</th><th>Status</th><th>Received</th></tr></thead><tbody>{recentRequests.map((request) => { const service = serviceConfig[String(request.serviceType || '').toUpperCase()] || { label: 'Service', color: '#687087', icon: 'clipboard' }; return <tr key={request.id}><td><b>#{request.id}</b></td><td><span className="admin-table-service" style={{ '--service-color': service.color }}><Icon name={service.icon} size={15}/>{service.label}</span></td><td>{formatMoney(request.amount)}</td><td><span className={`admin-status-badge ${String(request.status || '').toLowerCase()}`}>{String(request.status || 'Unknown').replaceAll('_', ' ')}</span></td><td>{formatDate(request.createdAt)}</td></tr> })}</tbody></table></div> : <div className="admin-empty-state"><span><Icon name="clipboard" size={24}/></span><b>No service requests yet</b><p>When customers submit requests, recent activity will appear here.</p></div>}</section>

            <div className="admin-side-stack">
              <section className="admin-panel" id="approvals"><div className="admin-panel-heading"><h2>Pending approvals</h2><span className="admin-count-badge">{loading ? '…' : formatCount(pendingPartners)}</span></div>{partners.length ? <div className="admin-approval-list">{partners.filter((partner) => String(partner?.status || '').toUpperCase() === 'PENDING').slice(0, 4).map((partner) => <div className="admin-approval-row" key={partner.id}><span className="admin-approval-icon"><Icon name="driver" size={17}/></span><div><b>{partner.businessName || partner.partnerType || 'Partner application'}</b><small>Partner verification</small></div><span className="admin-pending-label">Pending</span></div>)}</div> : <div className="admin-empty-mini">{loading ? 'Loading applications…' : 'No pending partner applications.'}</div>}<a className="admin-panel-link" href="/admin/drivers">Review applications <Icon name="arrow" size={15}/></a></section>

              <section className="admin-panel" id="support-cases"><div className="admin-panel-heading"><h2>Recent support cases</h2><span className="admin-small-tag">{loading ? '…' : `${formatCount(openTickets)} open`}</span></div>{tickets.length ? <div className="admin-complaint-list">{[...tickets].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 3).map((ticket) => <div className="admin-complaint-row" key={ticket.id}><span className="admin-complaint-icon"><Icon name="help" size={17}/></span><div><b>{ticket.topic || 'Support request'}</b><small>Case #{ticket.id} · {formatDate(ticket.createdAt)}</small></div><span className={`admin-status-badge ${String(ticket.status || '').toLowerCase()}`}>{String(ticket.status || 'Open')}</span></div>)}</div> : <div className="admin-empty-mini">{loading ? 'Loading support cases…' : 'No support cases yet.'}</div>}<a className="admin-panel-link" href="/admin/support">Open support queue <Icon name="arrow" size={15}/></a></section>
            </div>
          </div>
          <footer className="admin-footer"><span>© {new Date().getFullYear()} Dorkar Admin</span><span>Authorized access only · Data from the live admin API</span></footer>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboardPage
