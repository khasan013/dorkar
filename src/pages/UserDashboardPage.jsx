import { useState } from 'react'
import dorkarLogo from '../assets/D-Logo.png'
import heroScenery from '../assets/Hero-bg-illlustration.png'
import scooter from '../assets/signinpage.png'
import { readAuthSession, signOut } from '../auth/session'

const services = [
  { name: 'Ride Sharing', description: 'Book a ride quickly and at a fair price.', icon: 'car', color: 'ride', href: '/ride' },
  { name: 'Food Delivery', description: 'Order from your favorite restaurants.', icon: 'food', color: 'food', href: '/food' },
  { name: 'Parcel Delivery', description: 'Send and receive parcels easily.', icon: 'parcel', color: 'parcel', href: '/parcel' },
  { name: 'Blood Donation', description: 'Find or be a blood donor and save lives.', icon: 'blood', color: 'blood', href: '/blood' },
]

const activities = [
  { icon: 'car', color: 'ride', title: 'Ride to Gulshan 2', time: 'Today, 6:20 PM', amount: '৳360', status: 'Completed' },
  { icon: 'food', color: 'food', title: 'Food from Kacchi Bhai', time: 'Today, 1:15 PM', amount: '৳590', status: 'Delivered' },
  { icon: 'parcel', color: 'parcel', title: 'Parcel to Dhanmondi', time: 'Yesterday, 4:30 PM', amount: '৳120', status: 'Completed' },
]

function Icon({ name, size = 22 }) {
  const shapes = {
    car: <><path d="m4 13 2-5h12l2 5v5h-2v-2H6v2H4Zm3-5-1 4h12l-1-4Z"/><circle cx="7" cy="16" r="1.5"/><circle cx="17" cy="16" r="1.5"/></>,
    food: <><path d="M5 3v7m3-7v7m-3-3h3M7 10v11m9-18v18m0-18c3 4 3 8 0 10"/></>,
    parcel: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Zm-8 4.5 8 5 8-5M12 12.5V21"/></>,
    blood: <><path d="M12 3s-6 7-6 12a6 6 0 0 0 12 0c0-5-6-12-6-12Z"/><path d="M12 11v7m-3.5-3.5h7"/></>,
    pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Zm-8 12h4"/></>,
    chevron: <path d="m7 10 5 5 5-5"/>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name]}</svg>
}

function Brand() {
  return <a className="brand dashboard-brand" href="/" aria-label="Dorkar home"><img className="brand-symbol" src={dorkarLogo} alt=""/><span>Dorkar</span></a>
}

function DashboardNavbar() {
  const [menu, setMenu] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [location, setLocation] = useState('Dhaka')
  const user = readAuthSession()?.user
  const userName = user?.name || 'Dorkar user'
  const initials = userName.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
  const links = [['Home', '/dashboard'], ['Ride', '/ride'], ['Food', '/food'], ['Parcel', '/parcel'], ['Blood Donation', '/blood']]

  return <header className="dashboard-nav">
    <div className="dashboard-nav-inner">
      <Brand />
      <button className="dashboard-mobile-toggle" aria-label="Toggle navigation" onClick={() => setMobileOpen(!mobileOpen)}><Icon name="menu" /></button>
      <nav className={`dashboard-links ${mobileOpen ? 'is-open' : ''}`} aria-label="Main navigation">
        {links.map(([label, href], index) => <a className={index === 0 ? 'active' : ''} href={href} key={href}>{label}</a>)}
      </nav>
      <div className="dashboard-nav-actions">
        <div className="nav-menu-wrap">
          <button className="location-trigger" onClick={() => setMenu(menu === 'location' ? '' : 'location')} aria-expanded={menu === 'location'}><Icon name="pin" size={19}/><span>{location}</span><Icon name="chevron" size={17}/></button>
          {menu === 'location' && <div className="nav-popover location-popover"><b>Choose your area</b>{['Dhaka', 'Chattogram', 'Sylhet', 'Khulna'].map((city) => <button key={city} onClick={() => { setLocation(city); setMenu('') }}>{city}{city === location && <span>Current</span>}</button>)}</div>}
        </div>
        <div className="nav-menu-wrap">
          <button className="notification-trigger" aria-label="Notifications" aria-expanded={menu === 'notifications'} onClick={() => setMenu(menu === 'notifications' ? '' : 'notifications')}><Icon name="bell"/><i/></button>
          {menu === 'notifications' && <div className="nav-popover notification-popover"><b>Notifications</b><a href="/notifications">Your driver is on the way <small>Ride · 10 min ago</small></a><a href="/notifications">Kacchi Bhai received your order <small>Food · 1 hour ago</small></a><a className="popover-link" href="/notifications">View all notifications</a></div>}
        </div>
        <div className="nav-menu-wrap profile-menu-wrap">
          <button className="profile-trigger" onClick={() => setMenu(menu === 'profile' ? '' : 'profile')} aria-expanded={menu === 'profile'}><span className="profile-avatar">{(user?.avatarUrl||user?.profileImageUrl) ? <img src={user.avatarUrl||user.profileImageUrl} alt=""/> : initials}</span><span className="profile-name">{userName}</span><Icon name="chevron" size={17}/></button>
          {menu === 'profile' && <div className="nav-popover profile-popover"><b>{userName}</b><small>{user?.email || user?.phone}</small><a href="/profile">My Profile</a><a href="/settings">Account Settings</a><a href="/login" onClick={(event) => { event.preventDefault(); signOut() }}>Log out</a></div>}
        </div>
      </div>
    </div>
  </header>
}

function WelcomeHero() {
  const user = readAuthSession()?.user
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'there'
  return <section className="dashboard-hero">
    <img className="dashboard-landscape" src={heroScenery} alt="" />
    <div className="dashboard-hero-copy">
      <div className="dashboard-greeting">Welcome, {firstName}! <span>👋</span></div>
      <p className="dashboard-welcome">Your all-in-one on-demand services in Bangladesh.</p>
      <h1>Your Daily Needs,<br/>One App — <span>Dorkar</span></h1>
      <p className="dashboard-description">Ride, order food, send parcels, or donate blood —<br className="dashboard-desktop-break"/> all in one place.</p>
      <a href="/ride/booking" className="dashboard-book-button">Book a Ride</a>
    </div>
    <img className="dashboard-scooter" src={scooter} alt="Dorkar delivery scooter" />
  </section>
}

function ServiceCard({ service }) {
  return <a className={`dashboard-service-card ${service.color}`} href={service.href}>
    <span className="dashboard-service-icon"><Icon name={service.icon} size={28}/></span>
    <span className="dashboard-service-text"><b>{service.name}</b><small>{service.description}</small></span>
    
 </a>
}

function RecentActivity() {
  return <section className="recent-activity">
    <div className="activity-heading"><h2>Recent Activity</h2><a href="/activity">View All</a></div>
    <div className="activity-list">
      {activities.map((activity) => <article className="activity-row" key={activity.title}>
        <span className={`activity-icon ${activity.color}`}><Icon name={activity.icon} size={27}/></span>
        <div className="activity-details"><b>{activity.title}</b><small>{activity.time}</small></div>
        <div className="activity-result"><b>{activity.amount}</b><small>{activity.status}</small></div>
      </article>)}
    </div>
  </section>
}

export default function UserDashboardPage() {
  return <div className="dashboard-page">
    <DashboardNavbar />
    <main className="dashboard-content">
      <WelcomeHero />
      <section className="dashboard-services" aria-label="Dorkar services">{services.map((service) => <ServiceCard service={service} key={service.name}/>)}</section>
      <RecentActivity />
    </main>
  </div>
}
