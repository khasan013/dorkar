import { useEffect, useMemo, useState } from 'react'
import { readAuthSession } from '../../auth/session'
import {
  getAdminPartners, getAdminUsers, updateAdminPartnerStatus, submitPartnerApplication,
} from '../../services/adminApi'
import AdminLayout, { AdminIcon } from './AdminLayout'
import './AdminRolesPage.css'

const partnerTabs = [
  { id: 'roles', label: 'Admin Roles', icon: 'shield' },
  { id: 'restaurants', label: 'Restaurants', icon: 'food', type: 'RESTAURANT' },
  { id: 'riders', label: 'Delivery Riders', icon: 'driver', type: 'DELIVERY' },
  { id: 'drivers', label: 'Ride-share Drivers', icon: 'car', type: 'RIDE' },
]
const roleGuidance = [
  ['shield', 'Super Admin', 'Full platform administration'],
  ['grid', 'Operations Admin', 'Service operations, partners, and bookings'],
  ['card', 'Finance Admin', 'Payments, settlements, and financial reports'],
  ['help', 'Support Admin', 'Customer and partner support workflows'],
]
const partnerTypeNames = { RESTAURANT: 'Restaurant', DELIVERY: 'Delivery rider', RIDE: 'Ride-share driver' }
const dateLabel = value => value && !Number.isNaN(Date.parse(value))
  ? new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
  : '—'
const statusLabel = value => String(value || 'UNKNOWN').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase())
const initials = value => String(value || '').trim().split(/\s+/).slice(0, 2).map(word => word[0]?.toUpperCase()).join('') || 'D'

export default function AdminRolesPage() {
  const session = readAuthSession()
  const [admins, setAdmins] = useState([])
  const [partners, setPartners] = useState([])
  const [tab, setTab] = useState('roles')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [cityFilter, setCityFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [formType, setFormType] = useState('')
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [pendingStatus, setPendingStatus] = useState(null)
  const pageSize = 7

  const loadPageData = async signal => {
    setLoading(true)
    setError('')
    try {
      const [usersResult, partnersResult] = await Promise.all([
        getAdminUsers(session?.accessToken, signal),
        getAdminPartners(session?.accessToken, signal),
      ])
      setAdmins(Array.isArray(usersResult) ? usersResult.filter(user => String(user.role || '').toUpperCase() !== 'USER') : [])
      setPartners(Array.isArray(partnersResult) ? partnersResult : [])
    } catch (requestError) {
      if (requestError.name !== 'AbortError') {
        setError(requestError.status === 401 || requestError.status === 403
          ? 'Your administrator session expired or you do not have permission to view this workspace.'
          : requestError.message || 'Partner and administrator data could not be loaded.')
      }
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    loadPageData(controller.signal)
    // Refreshes are triggered after successful status changes and applications.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const activeTab = partnerTabs.find(item => item.id === tab)
  const selectedPartners = tab === 'roles' ? [] : partners.filter(item => String(item.partnerType || '').toUpperCase() === activeTab?.type)
  const cities = [...new Set(selectedPartners.map(item => String(item.location || '').split(',').at(-1).trim()).filter(Boolean))].sort()
  const rows = useMemo(() => {
    const source = tab === 'roles' ? admins : partners.filter(item => String(item.partnerType || '').toUpperCase() === activeTab?.type)
    const normalized = query.trim().toLowerCase()
    return source.filter(item => {
      const matchesText = !normalized || [item.name, item.businessName, item.phone, item.email, item.role, item.location].some(value => String(value || '').toLowerCase().includes(normalized))
      const matchesStatus = tab === 'roles' || statusFilter === 'ALL' || String(item.status || '').toUpperCase() === statusFilter
      const locationCity = String(item.location || '').split(',').at(-1).trim()
      const matchesCity = tab === 'roles' || cityFilter === 'ALL' || locationCity === cityFilter
      return matchesText && matchesStatus && matchesCity
    })
  }, [admins, partners, tab, activeTab?.type, query, statusFilter, cityFilter])

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const visibleRows = rows.slice((page - 1) * pageSize, page * pageSize)
  const applicationCounts = {
    RESTAURANT: partners.filter(item => String(item.partnerType || '').toUpperCase() === 'RESTAURANT').length,
    DELIVERY: partners.filter(item => String(item.partnerType || '').toUpperCase() === 'DELIVERY').length,
    RIDE: partners.filter(item => String(item.partnerType || '').toUpperCase() === 'RIDE').length,
  }

  const submitApplication = async event => {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity()) return
    const data = new FormData(form)
    const name = String(data.get('name') || '').trim()
    const businessName = String(data.get('businessName') || '').trim()
    const phone = String(data.get('phone') || '').replace(/[\s()-]/g, '')
    const phoneDigits = phone.replace(/\D/g, '')
    const normalizedPhone = phone.startsWith('+880') ? '+' + phoneDigits : phoneDigits.startsWith('880') ? '+' + phoneDigits : phoneDigits
    if (!/^(\+?88)?01[3-9]\d{8}$/.test(normalizedPhone)) {
      setError('Enter a valid Bangladesh mobile number.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const created = await submitPartnerApplication({
        name,
        businessName,
        partnerType: formType,
        phone: normalizedPhone,
        email: String(data.get('email') || '').trim() || null,
        location: String(data.get('location') || '').trim(),
      })
      setFormType('')
      setNotice('Partner application submitted. It is awaiting review; submission does not mark the partner as verified.')
      await loadPageData()
      if (created?.id) setTab(formType === 'RESTAURANT' ? 'restaurants' : formType === 'DELIVERY' ? 'riders' : 'drivers')
    } catch (requestError) {
      setError(requestError.message || 'Partner application could not be submitted.')
    } finally { setSaving(false) }
  }

  const saveStatus = async () => {
    if (!pendingStatus) return
    setSaving(true)
    setError('')
    try {
      await updateAdminPartnerStatus(pendingStatus.id, pendingStatus.status, session?.accessToken)
      setPendingStatus(null)
      setPage(1)
      await loadPageData()
    } catch (requestError) {
      setError(requestError.message || 'Partner application status could not be updated.')
    } finally { setSaving(false) }
  }

  const resetFilters = () => { setQuery(''); setStatusFilter('ALL'); setCityFilter('ALL'); setPage(1) }
  const changeTab = next => { setTab(next); resetFilters() }

  return <AdminLayout title="Admin Role & Access" description="Manage admin roles, permissions, and onboard platform partners (restaurants, delivery riders, and ride-share drivers).">
    <div className="admin-access-page">
      {error && <div className="admin-access-alert" role="alert"><AdminIcon name="shield" size={18}/><p>{error}</p><button type="button" onClick={() => loadPageData()}>Retry</button></div>}
      {notice && <div className="admin-access-notice" role="status"><span>✓</span><p>{notice}</p><button type="button" onClick={() => setNotice('')} aria-label="Dismiss notice">×</button></div>}

      <section className="admin-access-kpis">
        <article className="red"><span><AdminIcon name="users" size={22}/></span><div><small>Admin Users</small><b>{loading ? '—' : admins.length.toLocaleString('en-BD')}</b><i>Accounts with admin roles</i></div></article>
        <article className="blue"><span><AdminIcon name="food" size={22}/></span><div><small>Restaurant Applications</small><b>{loading ? '—' : applicationCounts.RESTAURANT.toLocaleString('en-BD')}</b><i>Partner applications</i></div></article>
        <article className="purple"><span><AdminIcon name="driver" size={22}/></span><div><small>Delivery Rider Applications</small><b>{loading ? '—' : applicationCounts.DELIVERY.toLocaleString('en-BD')}</b><i>Partner applications</i></div></article>
        <article className="orange"><span><AdminIcon name="car" size={22}/></span><div><small>Ride-share Driver Applications</small><b>{loading ? '—' : applicationCounts.RIDE.toLocaleString('en-BD')}</b><i>Partner applications</i></div></article>
      </section>

      <section className="admin-access-quick-add"><div><span className="admin-access-quick-icon"><AdminIcon name="driver" size={20}/></span><span><b>Quick Add Partner</b><small>Submit a restaurant, delivery rider, or ride-share driver application.</small></span></div><div className="admin-access-quick-actions"><button className="restaurant" type="button" onClick={() => setFormType('RESTAURANT')}><AdminIcon name="food" size={16}/>Add Restaurant</button><button className="delivery" type="button" onClick={() => setFormType('DELIVERY')}><AdminIcon name="driver" size={16}/>Add Delivery Rider</button><button className="rideshare" type="button" onClick={() => setFormType('RIDE')}><AdminIcon name="car" size={16}/>Add Ride-share Driver</button></div></section>

      <div className="admin-access-content-grid">
        <section className="admin-access-table-panel">
          <div className="admin-access-tabs" role="tablist" aria-label="Admin and partner management">
            {partnerTabs.map(item => <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} className={tab === item.id ? 'active' : ''} onClick={() => changeTab(item.id)}><AdminIcon name={item.icon} size={16}/>{item.label}{item.type && <small>{applicationCounts[item.type]}</small>}</button>)}
          </div>
          <div className="admin-access-table-heading"><div><span className="admin-access-section-icon"><AdminIcon name={activeTab?.icon || 'shield'} size={19}/></span><div><h2>{tab === 'roles' ? 'Administrator accounts' : activeTab.label + ' applications'} <span>{loading ? '…' : rows.length.toLocaleString('en-BD')}</span></h2><p>{tab === 'roles' ? 'Review administrator accounts and their current backend role.' : 'Review onboarding applications and update supported review status.'}</p></div></div>{tab !== 'roles' && <button type="button" className="admin-access-add-button" onClick={() => setFormType(activeTab.type)}>＋ Add {activeTab.label.replace(/s$/, '').replace('Ride-share Driver', 'Ride-share Driver')}</button>}</div>

          <div className="admin-access-filters"><label><AdminIcon name="search" size={16}/><input value={query} onChange={event => { setQuery(event.target.value); setPage(1) }} placeholder={tab === 'roles' ? 'Search admin name or phone…' : 'Search name, business, or phone…'} aria-label="Search records"/></label>{tab !== 'roles' && <><select value={statusFilter} onChange={event => { setStatusFilter(event.target.value); setPage(1) }} aria-label="Filter by application status"><option value="ALL">All Status</option><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option></select><select value={cityFilter} onChange={event => { setCityFilter(event.target.value); setPage(1) }} aria-label="Filter by city"><option value="ALL">All Cities</option>{cities.map(city => <option key={city}>{city}</option>)}</select></>}<button type="button" onClick={resetFilters}><AdminIcon name="close" size={14}/>Reset</button></div>

          <div className="admin-access-table-scroll"><table className="admin-access-table"><thead><tr>{tab === 'roles' ? <><th>Administrator</th><th>Phone</th><th>Current role</th><th>Joined date</th></> : <><th>Partner / Applicant</th><th>Partner type</th><th>Phone</th><th>City / Area</th><th>Applied</th><th>Status</th><th>Actions</th></>}</tr></thead><tbody>
            {loading && Array.from({length:5},(_,index)=><tr className="admin-access-skeleton" key={index}><td colSpan={tab === 'roles' ? '4' : '7'}><i/></td></tr>)}
            {!loading && visibleRows.map(item => tab === 'roles'
              ? <tr key={item.id}><td><div className="admin-access-person"><span>{initials(item.name)}</span><div><b>{item.name || 'Administrator'}</b><small>Account #{item.id}</small></div></div></td><td>{item.phone || '—'}</td><td><span className="admin-access-role-badge">{String(item.role || 'ADMIN').replaceAll('_',' ')}</span></td><td>{dateLabel(item.createdAt)}</td></tr>
              : <tr key={item.id}><td><div className="admin-access-person"><span className={activeTab.type.toLowerCase()}>{initials(item.businessName || item.name)}</span><div><b>{item.businessName || item.name || 'Partner application'}</b><small>{item.name || 'Applicant'} · #{item.id}</small></div></div></td><td>{partnerTypeNames[String(item.partnerType || '').toUpperCase()] || statusLabel(item.partnerType)}</td><td>{item.phone || '—'}</td><td>{item.location || '—'}</td><td>{dateLabel(item.createdAt)}</td><td><span className={'admin-access-status ' + String(item.status || '').toLowerCase()}>{statusLabel(item.status)}</span></td><td><div className="admin-access-row-actions"><button type="button" aria-label={'View application ' + item.id} onClick={() => setSelectedRecord(item)}><AdminIcon name="search" size={15}/></button><select aria-label={'Update application ' + item.id + ' status'} value={item.status || 'PENDING'} onChange={event => { if (event.target.value !== item.status) setPendingStatus({id:item.id,status:event.target.value,record:item}) }}><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option></select></div></td></tr>)}
            {!loading && rows.length === 0 && <tr><td colSpan={tab === 'roles' ? '4' : '7'}><div className="admin-access-empty"><span><AdminIcon name={tab === 'roles' ? 'shield' : activeTab.icon} size={22}/></span><b>{tab === 'roles' ? 'No administrator accounts found' : 'No applications in this category'}</b><p>{tab === 'roles' ? 'Accounts with administrator roles will appear here.' : 'New partner applications will appear here after submission.'}</p></div></td></tr>}
            {!loading && rows.length > 0 && visibleRows.length === 0 && <tr><td colSpan={tab === 'roles' ? '4' : '7'}><div className="admin-access-empty"><b>No records match these filters</b><button type="button" onClick={resetFilters}>Reset filters</button></div></td></tr>}
          </tbody></table></div>
          <div className="admin-access-pagination"><span>{rows.length ? 'Showing ' + ((page - 1) * pageSize + 1) + '–' + Math.min(page * pageSize, rows.length) + ' of ' + rows.length.toLocaleString('en-BD') : 'Showing 0 records'}</span><div><button type="button" disabled={page <= 1 || loading} onClick={() => setPage(value => Math.max(1,value-1))} aria-label="Previous page">Previous</button><span>Page {page} of {totalPages}</span><button type="button" disabled={page >= totalPages || loading} onClick={() => setPage(value => Math.min(totalPages,value+1))} aria-label="Next page">Next</button></div></div>
        </section>

        <aside className="admin-access-side">
          <section className="admin-access-side-panel"><div className="admin-access-side-heading"><div><h2>Admin Roles & Permissions</h2><p>Suggested least-privilege role structure.</p></div><span className="admin-access-lock"><AdminIcon name="shield" size={16}/></span></div><div className="admin-access-role-list">{roleGuidance.map(([icon,name,description],index)=><article key={name}><span className={'admin-access-role-icon role-' + index}><AdminIcon name={icon} size={16}/></span><div><b>{name}</b><small>{description}</small></div><span className="admin-access-pending-badge">Design</span></article>)}</div><div className="admin-access-disabled-wrap"><button type="button" disabled><AdminIcon name="settings" size={15}/>Manage Roles & Permissions</button><small>Role and permission management endpoints are not available yet.</small></div></section>
          <section className="admin-access-side-panel admin-access-activity"><div className="admin-access-side-heading"><div><h2>Recent Admin Activity</h2><p>Audit history for sensitive changes.</p></div><span className="admin-access-lock"><AdminIcon name="clipboard" size={16}/></span></div><div className="admin-access-audit-empty"><span><AdminIcon name="clipboard" size={20}/></span><b>Audit log unavailable</b><p>The backend does not currently provide admin activity records.</p></div></section>
          <section className="admin-access-current-role"><span><AdminIcon name="shield" size={16}/></span><div><small>Signed in as</small><b>{session?.user?.name || 'Administrator'}</b><i>{session?.user?.role || 'Admin'}</i></div></section>
        </aside>
      </div>
    </div>

    {formType && <div className="admin-access-modal-backdrop" role="presentation" onMouseDown={event => {if(event.target===event.currentTarget&&!saving)setFormType('')}}><section className="admin-access-modal" role="dialog" aria-modal="true" aria-labelledby="admin-access-form-title"><button className="admin-access-modal-close" type="button" onClick={() => setFormType('')} aria-label="Close">×</button><span className="admin-access-modal-icon"><AdminIcon name={formType === 'RESTAURANT' ? 'food' : formType === 'DELIVERY' ? 'driver' : 'car'} size={20}/></span><span className="admin-access-modal-kicker">PARTNER ONBOARDING</span><h2 id="admin-access-form-title">Add {partnerTypeNames[formType]}</h2><p>Creates a partner application for review. Submission does not verify or activate the partner.</p><form onSubmit={submitApplication}><label>{formType === 'RESTAURANT' ? 'Owner / contact name' : 'Full name'}<input name="name" required maxLength="140" autoComplete="name" placeholder="Full name"/></label><label>{formType === 'RESTAURANT' ? 'Restaurant name' : 'Partner name'}<input name="businessName" required maxLength="160" placeholder={formType === 'RESTAURANT' ? 'Restaurant or brand name' : 'Name shown in partner application'}/></label><label>Phone number<input name="phone" required type="tel" inputMode="tel" placeholder="01XXXXXXXXX"/></label><label>Email address (optional)<input name="email" type="email" maxLength="190" placeholder="name@example.com"/></label><label className="full">City and service area<input name="location" required maxLength="240" placeholder="Gulshan, Dhaka"/></label><div className="admin-access-form-note"><AdminIcon name="shield" size={15}/>Identity documents and partner-specific onboarding details are not supported by the current backend.</div><button type="submit" disabled={saving}>{saving ? 'Submitting…' : 'Submit application'}</button></form></section></div>}

    {selectedRecord && <div className="admin-access-modal-backdrop" role="presentation" onMouseDown={event => {if(event.target===event.currentTarget)setSelectedRecord(null)}}><section className="admin-access-modal admin-access-detail-modal" role="dialog" aria-modal="true" aria-labelledby="admin-access-detail-title"><button className="admin-access-modal-close" type="button" onClick={() => setSelectedRecord(null)} aria-label="Close details">×</button><span className="admin-access-modal-kicker">PARTNER APPLICATION #{selectedRecord.id}</span><h2 id="admin-access-detail-title">{selectedRecord.businessName || partnerTypeNames[String(selectedRecord.partnerType || '').toUpperCase()]}</h2><dl><div><dt>Applicant</dt><dd>{selectedRecord.name || '—'}</dd></div><div><dt>Type</dt><dd>{partnerTypeNames[String(selectedRecord.partnerType || '').toUpperCase()] || selectedRecord.partnerType}</dd></div><div><dt>Phone</dt><dd>{selectedRecord.phone || '—'}</dd></div><div><dt>Email</dt><dd>{selectedRecord.email || 'Not provided'}</dd></div><div><dt>Location</dt><dd>{selectedRecord.location || '—'}</dd></div><div><dt>Submitted</dt><dd>{dateLabel(selectedRecord.createdAt)}</dd></div><div><dt>Review status</dt><dd>{statusLabel(selectedRecord.status)}</dd></div></dl><button className="admin-access-detail-done" type="button" onClick={() => setSelectedRecord(null)}>Close</button></section></div>}

    {pendingStatus && <div className="admin-access-modal-backdrop" role="presentation"><section className="admin-access-confirm" role="alertdialog" aria-modal="true" aria-labelledby="admin-access-confirm-title"><span><AdminIcon name="shield" size={20}/></span><h2 id="admin-access-confirm-title">Update application status?</h2><p>Change application #{pendingStatus.id} from {statusLabel(pendingStatus.record.status)} to {statusLabel(pendingStatus.status)}.</p><div><button type="button" onClick={() => setPendingStatus(null)} disabled={saving}>Cancel</button><button type="button" onClick={saveStatus} disabled={saving}>{saving ? 'Saving…' : 'Confirm update'}</button></div></section></div>}
  </AdminLayout>
}

