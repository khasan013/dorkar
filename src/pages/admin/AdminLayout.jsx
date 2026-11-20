import { useState } from 'react'
import { readAuthSession, signOut } from '../../auth/session'
import { adminRoleLabel, canAccessAdminPath } from '../../auth/adminRoles'

export const adminMenuGroups = [
  { title: 'Platform management', items: [['users', 'Users & Customers'], ['drivers', 'Drivers & Delivery'], ['rides', 'Ride Management'], ['food', 'Food Management'], ['parcels', 'Parcel Management'], ['blood', 'Blood Donation']] },
  { title: 'Operations', items: [['orders', 'Orders & Bookings'], ['payments', 'Payments & Transactions'], ['promotions', 'Promotions & Coupons'], ['support', 'Support & Complaints']] },
  { title: 'Analytics & settings', items: [['reports', 'Reports & Analytics'], ['settings', 'Settings'], ['access', 'Admin Role & Access'], ['logs', 'System Logs']] },
]

const routeIcons = {
  dashboard: 'grid', users: 'users', drivers: 'driver', rides: 'car', food: 'food', parcels: 'box', blood: 'blood',
  orders: 'clipboard', payments: 'card', promotions: 'tag', support: 'help', reports: 'chart', settings: 'settings',
  access: 'shield', logs: 'clipboard',
}

export function AdminIcon({ name, size = 20 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    users: <><path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20"/><circle cx="9.5" cy="7" r="3.5"/><path d="M17 11a3.5 3.5 0 1 0-1-6.8M21 20v-1.5a4 4 0 0 0-2.8-3.8"/></>,
    driver: <><circle cx="12" cy="7" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    car: <><path d="m5 11 1.7-4.2A2 2 0 0 1 8.6 5h6.8a2 2 0 0 1 1.9 1.8L19 11"/><path d="M3 11h18v7H3zM6 18v2m12-2v2"/></>,
    food: <><path d="M4 3v7a3 3 0 0 0 6 0V3M7 3v18M17 3v18M17 3c3 2 3 7 0 9"/></>,
    box: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="M3 8v9l9 5 9-5V8M12 13v9"/></>,
    blood: <><path d="M12 3S5 11 5 15.2a7 7 0 0 0 14 0C19 11 12 3 12 3Z"/><path d="M9 15h6m-3-3v6"/></>,
    clipboard: <><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M8 10h8m-8 4h8"/></>,
    card: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></>,
    tag: <><path d="m20 13-7 7L3 10V4h6l11 9Z"/><circle cx="7.5" cy="7.5" r="1"/></>,
    help: <><path d="M4 13v-2a8 8 0 0 1 16 0v2M4 13a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 2Zm16 0a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2Z"/></>,
    chart: <><path d="M4 20V11m5 9V5m6 15v-7m5 7V3"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19 13 2 1-2 4-2-1a8 8 0 0 1-3 1l-.5 2h-4L9 18a8 8 0 0 1-2-1l-2 1-2-4 2-1a7 7 0 0 1 0-2l-2-1 2-4 2 1a8 8 0 0 1 2-1l.5-2h4l.5 2a8 8 0 0 1 2 1l2-1 2 4-2 1a7 7 0 0 1 0 2Z"/></>,
    shield: <><path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z"/><path d="m9 12 2 2 4-4"/></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12h4"/></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    chevron: <path d="m7 10 5 5 5-5"/>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></>,
    alert: <><path d="m10.3 4.3-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-2.7l-8-14a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4m0 4h.01"/></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.6 9a7 7 0 0 1 11.6-2L20 12M4 12l2.8 5a7 7 0 0 0 11.6-2"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5m-5 5V3"/></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.grid}</svg>
}

function Brand() {
  return <a className="admin-brand" href="/" aria-label="Dorkar home"><img src="/D-Logo-transparent.png" alt=""/><span>Dorkar</span></a>
}

export default function AdminLayout({ title, description, children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const session = readAuthSession()
  const name = session?.user?.name || 'Administrator'
  const role = session?.user?.role || 'ADMIN'
  const initials = name.split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase()
  const currentSection = window.location.pathname.split('/')[2] || 'dashboard'

  return <div className="admin-app-shell">
    <header className="admin-topbar">
      <div className="admin-topbar-brand"><Brand/><span className="admin-panel-badge">Admin Panel</span></div>
      <nav className="admin-top-links" aria-label="Service shortcuts"><a href="/">Home</a><a href="/ride">Ride</a><a href="/food">Food</a><a href="/parcel">Parcel</a><a href="/blood">Blood Donation</a></nav>
      <div className="admin-top-actions">
        <a className="admin-layout-search" href="/admin/users"><AdminIcon name="search" size={17}/><span>Search users, orders, rides...</span></a>
        <button className="admin-icon-button has-dot" type="button" aria-label="Notifications" onClick={() => window.location.assign('/admin/support')}><AdminIcon name="bell"/></button>
        <div className="admin-popover-wrap">
          <button className="admin-profile-button" type="button" onClick={() => setProfileOpen(!profileOpen)} aria-expanded={profileOpen}><span className="admin-avatar">{initials}</span><span className="admin-profile-copy"><b>{name}</b><small>{adminRoleLabel(role)}</small></span><span className="admin-chevron"><AdminIcon name="chevron" size={14}/></span></button>
          {profileOpen && <div className="admin-popover admin-account-popover"><b>{name}</b><a href="/profile">My profile</a><button type="button" onClick={signOut}>Sign out</button></div>}
        </div>
        <button className="admin-mobile-menu" type="button" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMobileOpen(!mobileOpen)}><AdminIcon name={mobileOpen ? 'close' : 'menu'}/></button>
      </div>
    </header>
    <div className="admin-workspace">
      <button className={`admin-sidebar-scrim ${mobileOpen ? 'is-visible' : ''}`} aria-label="Close navigation" onClick={() => setMobileOpen(false)}/>
      <aside className={`admin-sidebar ${mobileOpen ? 'is-open' : ''}`} aria-label="Admin navigation">
        <a className={`admin-menu-link ${currentSection === 'dashboard' ? 'is-active' : ''}`} href="/admin"><AdminIcon name="grid"/><span>Dashboard</span></a>
        {adminMenuGroups.map(group => {
          const items = group.items.filter(([id]) => canAccessAdminPath(role, `/admin/${id}`))
          return items.length ? <div className="admin-menu-group" key={group.title}><h2>{group.title}</h2>{items.map(([id, label]) => <a className={`admin-menu-link ${currentSection === id ? 'is-active' : ''}`} href={`/admin/${id}`} key={id} onClick={() => setMobileOpen(false)}><AdminIcon name={routeIcons[id]}/><span>{label}</span></a>)}</div> : null
        })}
        <div className="admin-sidebar-foot"><span className="admin-status-dot"/><span>Platform status</span><b>Operational</b></div>
      </aside>
      <main className="admin-main">
        <div className="admin-page-heading"><div><div className="admin-heading-kicker"><span className="admin-live-dot"/>Dorkar administration</div><h1>{title}</h1><p>{description}</p></div></div>
        {children}
        <footer className="admin-footer"><span>© {new Date().getFullYear()} Dorkar Admin</span><span>Authorized access only</span></footer>
      </main>
    </div>
  </div>
}
