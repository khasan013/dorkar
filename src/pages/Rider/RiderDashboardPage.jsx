import { useEffect, useState } from 'react'
import { readAuthSession, signOut } from '../../auth/session'
import dorkarLogo from '../../assets/D-Logo.png'
import './RiderDashboardPage.css'

const sections = [
  ['dashboard', 'Dashboard', '/rider/dashboard'],
  ['deliveries', 'My Deliveries', '/rider/deliveries'],
  ['earnings', 'Earnings', '/rider/earnings'],
  ['performance', 'Performance', '/rider/performance'],
]
const apiBase = (import.meta.env.VITE_API_BASE_URL || 'https://dorker-backend.onrender.com').trim().replace(/\/$/, '')
const appLinks = [
  ['Google Play', import.meta.env.VITE_RIDER_ANDROID_URL],
  ['App Store', import.meta.env.VITE_RIDER_IOS_URL],
].filter(([, href]) => href)

function Icon({ name, size = 21 }) {
  const paths = {
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></>,
    bag: <><path d="M5 8h14l1 12H4L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/><path d="M9 12v2m6-2v2"/></>,
    wallet: <><rect x="3" y="5" width="18" height="15" rx="2.5"/><path d="M3 9h18m-5 5h2"/></>,
    chart: <><path d="M4 20V11m5 9V5m5 15v-7m5 7V3"/><path d="M2 20h20"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></>,
    distance: <><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8 16.5c2.2-4.7 5.8-5.3 8-10"/></>,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6"/></>,
    profile: <><circle cx="12" cy="8" r="3.5"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></>,
    logo: <><path d="M7 5h8.3a6.7 6.7 0 0 1 0 13.4H9"/><path d="M4 5h6l5 6-5 7H4l5-7-5-6Z"/></>,
  }
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

function EmptyPanel({ icon, title, message }) {
  return <div className="rider-empty"><span><Icon name={icon} size={22}/></span><b>{title}</b><p>{message}</p></div>
}

export default function RiderDashboardPage() {
  const session = readAuthSession()
  const user = session?.user || {}
  const partnerType = String(user.partnerType || '').toUpperCase()
  const isRideShare = partnerType === 'RIDE' || partnerType.includes('RIDE_SHARE') || partnerType.includes('RIDE-SHARE')
  const riderType = isRideShare ? 'Ride-share Driver' : 'Food Delivery Rider'
  const workLabel = isRideShare ? 'Trips' : 'Deliveries'
  const [profile, setProfile] = useState(user)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const pathSection = window.location.pathname.split('/')[2] || 'dashboard'
  const section = sections.some(([key]) => key === pathSection) ? pathSection : 'dashboard'
  const current = sections.find(([key]) => key === section)
  const displayName = profile.name || 'Rider account'
  const avatar = profile.avatarUrl || profile.profileImageUrl
  const accountId = profile.id ? `Account ID · ${profile.id}` : 'Rider ID not assigned'

  useEffect(() => {
    if (!session?.accessToken) return undefined
    const controller = new AbortController()
    fetch(`${apiBase}/api/v1/users/me`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${session.accessToken}` },
      signal: controller.signal,
    }).then(async response => {
      const result = await response.json().catch(() => null)
      if (response.ok && result?.data) setProfile(result.data)
    }).catch(() => {})
    return () => controller.abort()
  }, [session?.accessToken])

  const metrics = [
    { icon: 'bag', label: `Completed ${workLabel}`, value: '—', note: 'Rider activity data unavailable', color: 'red' },
    { icon: 'wallet', label: 'Total Earnings', value: '—', note: 'Earnings data unavailable', color: 'green' },
    { icon: 'distance', label: 'Total Distance', value: '—', note: 'Distance data unavailable', color: 'blue' },
    { icon: 'star', label: 'Your Rating', value: '—', note: 'No rating records available', color: 'purple' },
  ]

  return <div className="rider-portal">
    {mobileNavOpen && <button className="rider-scrim" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation"/>}
    <aside className={`rider-sidebar ${mobileNavOpen ? 'is-open' : ''}`}>
      <a className="rider-brand" href="/rider/dashboard"><img src={dorkarLogo} alt=""/><span>Dorkar</span></a>
      <div className="rider-sidebar-profile">
        <span className="rider-avatar">{avatar ? <img src={avatar} alt=""/> : <Icon name="profile" size={27}/>}</span>
        <span className="rider-profile-copy"><b>{displayName}</b><small>{riderType}</small><em>{accountId}</em></span>
      </div>
      <nav className="rider-nav" aria-label="Rider dashboard pages">
        {sections.map(([key, label, href]) => <a key={key} href={href} className={section === key ? 'active' : ''} onClick={() => setMobileNavOpen(false)}><Icon name={key === 'dashboard' ? 'grid' : key === 'deliveries' ? 'bag' : key === 'earnings' ? 'wallet' : 'chart'}/><span>{label}</span></a>)}
      </nav>
      <section className="rider-app-card"><span className="rider-app-icon"><Icon name="bag" size={23}/></span><b>For active work</b><p>Order offers, navigation, and delivery actions belong in the Dorkar Rider mobile app.</p>{appLinks.length > 0 ? <div className="rider-app-links">{appLinks.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noreferrer">Get the app <Icon name="arrow" size={14}/></a>)}</div> : <small>Official app links will appear here when configured.</small>}</section>
      <div className="rider-sidebar-foot"><span/><b>Rider account</b><small>Reporting workspace</small></div>
    </aside>

    <main className="rider-main">
      <header className="rider-header"><div className="rider-header-title"><button className="rider-mobile-menu" type="button" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><Icon name="menu"/></button><div><span className="rider-kicker">DORKAR RIDER PORTAL</span><h1>{section === 'dashboard' ? 'Rider Dashboard' : current[1]}</h1><p>View your performance, earnings, and {isRideShare ? 'trip' : 'delivery'} history.</p></div></div><div className="rider-header-actions"><span className="rider-readonly-label">Reporting only</span><div className="rider-account-wrap"><button type="button" className="rider-account-button" onClick={() => setProfileOpen(!profileOpen)} aria-expanded={profileOpen}><span className="rider-header-avatar">{avatar ? <img src={avatar} alt=""/> : <Icon name="profile" size={20}/>}</span><span><b>{displayName}</b><small>{riderType}</small></span><span aria-hidden="true">⌄</span></button>{profileOpen && <div className="rider-account-popover"><b>{displayName}</b><small>{profile.email || profile.phone || riderType}</small><a href="/profile">My profile</a><button type="button" onClick={signOut}>Sign out</button></div>}</div></div></header>

      {section === 'dashboard' && <>
        <section className="rider-metrics" aria-label="Rider performance summary">{metrics.map(metric => <article className={`rider-metric ${metric.color}`} key={metric.label}><span className="rider-metric-icon"><Icon name={metric.icon} size={22}/></span><div><small>{metric.label}</small><b>{metric.value}</b><span>{metric.note}</span></div></article>)}</section>
        <section className="rider-dashboard-grid">
          <article className="rider-panel rider-progress-panel"><header><div><h2>Today’s Progress</h2><p>{workLabel} completed today</p></div><span className="rider-panel-chip">No activity data</span></header><EmptyPanel icon="chart" title="Progress isn’t available yet" message="The backend does not currently provide rider work records or a daily target."/></article>
          <article className="rider-panel rider-earnings-panel"><header><div><h2>Today’s Earnings</h2><p>Daily totals and earnings breakdown</p></div></header><EmptyPanel icon="wallet" title="Earnings aren’t available yet" message="Earnings will appear here when rider payment records are connected."/></article>
          <article className="rider-panel rider-recent-panel"><header><div><h2>Recent {workLabel}</h2><p>Completed work for your account</p></div><a href="/rider/deliveries">View history <Icon name="arrow" size={15}/></a></header><EmptyPanel icon="clock" title={`No ${workLabel.toLowerCase()} to show`} message="The rider API does not yet provide assigned or completed work history."/></article>
        </section>
        <p className="rider-data-note">Your rider account is connected. Summary numbers will show when delivery assignments, earnings, distance, and ratings are available from the backend.</p>
      </>}

      {section !== 'dashboard' && <section className="rider-panel rider-section-panel"><span className="rider-section-icon"><Icon name={section === 'deliveries' ? 'bag' : section === 'earnings' ? 'wallet' : 'chart'} size={25}/></span><h2>{current[1]}</h2><p>{section === 'deliveries' ? `Review your completed ${workLabel.toLowerCase()} and their recorded status.` : section === 'earnings' ? 'Review your recorded rider earnings and payment history.' : 'Review verified rider performance metrics and ratings.'}</p><EmptyPanel icon={section === 'deliveries' ? 'clock' : section === 'earnings' ? 'wallet' : 'chart'} title="No rider records available" message="This page will populate when the backend provides your rider-specific records."/></section>}
      <footer className="rider-footer">© {new Date().getFullYear()} Dorkar · Private rider workspace</footer>
    </main>
  </div>
}
