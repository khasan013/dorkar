import { useEffect, useMemo, useState } from 'react'
import { readAuthSession } from '../../auth/session'
import { getAdminUsers } from '../../services/adminApi'
import AdminLayout, { AdminIcon } from './AdminLayout'
import './UsersPage.css'

const PAGE_SIZE = 8
const numberFormat = new Intl.NumberFormat('en-BD')

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || 'U'
}

function StatCard({ icon, label, value, tone, note }) {
  return <article className={`users-stat-card ${tone}`}>
    <span className="users-stat-icon"><AdminIcon name={icon} size={21}/></span>
    <div className="users-stat-copy"><span>{label}</span><strong>{value}</strong><small>{note}</small></div>
    <span className="users-stat-watermark"><AdminIcon name={icon} size={55}/></span>
  </article>
}

export default function UsersPage() {
  const session = readAuthSession()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [joinedRange, setJoinedRange] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)

  const loadUsers = async (signal) => {
    setLoading(true)
    setError('')
    try {
      const result = await getAdminUsers(session?.accessToken, signal)
      setUsers(Array.isArray(result) ? result.filter(user => String(user.role || '').toUpperCase() === 'USER') : [])
    } catch (requestError) {
      if (requestError.name !== 'AbortError') {
        setError(requestError.status === 401 || requestError.status === 403
          ? 'Your administrator session may have expired. Sign in again to view customer accounts.'
          : requestError.message || 'Users could not be loaded. Please try again.')
      }
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    loadUsers(controller.signal)
    return () => controller.abort()
    // Load once per mounted page; session changes are handled by the protected route.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const now = Date.now()
    const days = joinedRange === '30' ? 30 : joinedRange === '90' ? 90 : joinedRange === 'year' ? 365 : null

    return users.filter(user => {
      const textMatches = !normalizedQuery || [user.name, user.phone, user.email]
        .some(value => String(value || '').toLowerCase().includes(normalizedQuery))
      if (!textMatches) return false
      if (!days) return true
      const joinedAt = Date.parse(user.createdAt || '')
      return Number.isFinite(joinedAt) && joinedAt >= now - days * 24 * 60 * 60 * 1000
    })
  }, [users, query, joinedRange])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE))
  const visibleUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const newUsers = users.filter(user => {
    const joinedAt = Date.parse(user.createdAt || '')
    return Number.isFinite(joinedAt) && joinedAt >= Date.now() - 30 * 24 * 60 * 60 * 1000
  }).length

  const changeFilter = setter => value => {
    setter(value)
    setPage(1)
  }

  const resetFilters = () => {
    setQuery('')
    setJoinedRange('all')
    setPage(1)
  }

  return <AdminLayout title="Users & Customers" description="Browse user accounts and review customer activity.">
    <div className="users-page">
      {error && <div className="users-alert" role="alert"><span><AdminIcon name="shield" size={18}/></span><p>{error}</p><button type="button" onClick={() => loadUsers()}>Try again</button></div>}

      <section className="users-stat-grid" aria-label="User account summary">
        <StatCard icon="users" label="Total Users" value={loading ? '—' : numberFormat.format(users.length)} tone="blue" note="Customer accounts"/>
        <StatCard icon="driver" label="New Users" value={loading ? '—' : numberFormat.format(newUsers)} tone="purple" note="Joined in the last 30 days"/>
        <StatCard icon="shield" label="Verified Users" value="—" tone="orange" note="Verification data unavailable"/>
        <StatCard icon="close" label="Blocked / Suspended" value="—" tone="red" note="Account status data unavailable"/>
      </section>

      <section className="users-table-panel" aria-labelledby="all-users-title">
        <div className="users-panel-heading">
          <div><div className="users-panel-title-row"><h2 id="all-users-title">All Users</h2><span>{loading ? '…' : numberFormat.format(filteredUsers.length)}</span></div><p>Manage, verify, and monitor all platform users.</p></div>
          <div className="users-panel-actions"><span className="users-api-note">Live account data</span></div>
        </div>

        <div className="users-filters">
          <label className="users-search"><AdminIcon name="search" size={18}/><input value={query} onChange={event => changeFilter(setQuery)(event.target.value)} placeholder="Search by name or phone…" aria-label="Search users by name or phone"/><button type="button" aria-label="Clear search" onClick={() => changeFilter(setQuery)('')} hidden={!query}>×</button></label>
          <label className="users-select-wrap"><span className="sr-only">Joined date</span><select value={joinedRange} onChange={event => changeFilter(setJoinedRange)(event.target.value)}><option value="all">Joined: All Time</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="year">Last 12 months</option></select><AdminIcon name="chevron" size={16}/></label>
          <button className="users-reset" type="button" onClick={resetFilters}><AdminIcon name="close" size={15}/>Reset</button>
        </div>

        <div className="users-table-scroll">
          <table className="users-table">
            <thead><tr><th scope="col">User</th><th scope="col">Phone</th><th scope="col">Joined Date</th><th scope="col">Account type</th><th scope="col">Actions</th></tr></thead>
            <tbody>
              {loading && Array.from({ length: 5 }, (_, index) => <tr key={`loading-${index}`} className="users-loading-row"><td colSpan="5"><i/></td></tr>)}
              {!loading && visibleUsers.map(user => <tr key={user.id}>
                <td><div className="users-identity"><span className="users-avatar">{initials(user.name)}</span><span><b>{user.name || 'Unnamed user'}</b><small>Customer account</small></span></div></td>
                <td>{user.phone || '—'}</td>
                <td>{formatDate(user.createdAt)}</td>
                <td><span className="users-role-badge">{String(user.role || 'USER').replaceAll('_', ' ')}</span></td>
                <td><button className="users-view-button" type="button" onClick={() => setSelectedUser(user)} aria-label={`View ${user.name || 'user'} details`} title="View account details"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.7"/></svg></button></td>
              </tr>)}
              {!loading && !error && visibleUsers.length === 0 && <tr><td colSpan="5"><div className="users-empty"><span><AdminIcon name="users" size={23}/></span><b>{users.length ? 'No users match these filters' : 'No customer accounts found'}</b><p>{users.length ? 'Try changing your search or joined date.' : 'Customer accounts will appear here when they register.'}</p>{(query || joinedRange !== 'all') && <button type="button" onClick={resetFilters}>Clear filters</button>}</div></td></tr>}
            </tbody>
          </table>
        </div>

        <div className="users-pagination"><span>{loading ? 'Loading customer accounts…' : filteredUsers.length ? `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filteredUsers.length)} of ${numberFormat.format(filteredUsers.length)} users` : 'Showing 0 users'}</span><div><button type="button" aria-label="Previous page" disabled={page <= 1 || loading} onClick={() => setPage(current => Math.max(1, current - 1))}>Previous</button><span>Page {page} of {totalPages}</span><button type="button" aria-label="Next page" disabled={page >= totalPages || loading} onClick={() => setPage(current => Math.min(totalPages, current + 1))}>Next</button></div></div>
      </section>
    </div>

    {selectedUser && <div className="users-dialog-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setSelectedUser(null) }}><section className="users-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="user-detail-title"><button className="users-dialog-close" type="button" aria-label="Close user details" onClick={() => setSelectedUser(null)}>×</button><span className="users-dialog-avatar">{initials(selectedUser.name)}</span><span className="users-dialog-kicker">CUSTOMER ACCOUNT</span><h2 id="user-detail-title">{selectedUser.name || 'Unnamed user'}</h2><dl><div><dt>Phone number</dt><dd>{selectedUser.phone || 'Not provided'}</dd></div><div><dt>Account type</dt><dd>{String(selectedUser.role || 'USER').replaceAll('_', ' ')}</dd></div><div><dt>Joined</dt><dd>{formatDate(selectedUser.createdAt)}</dd></div><div><dt>Email</dt><dd>Not provided by the current admin API</dd></div></dl><p className="users-dialog-note">Account status, verification, and order history are not included in the current admin user response.</p><button className="users-dialog-done" type="button" onClick={() => setSelectedUser(null)}>Done</button></section></div>}
  </AdminLayout>
}
