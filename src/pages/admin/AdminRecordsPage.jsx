import { useEffect, useMemo, useState } from 'react'
import { readAuthSession } from '../../auth/session'
import {
  getAdminPartners, getAdminRequests, getAdminTickets,
  updateAdminPartnerStatus, updateAdminRequestStatus, updateAdminTicketStatus,
} from '../../services/adminApi'
import AdminLayout, { AdminIcon } from './AdminLayout'
import './AdminRecordsPage.css'

const requestStatuses = ['REQUESTED', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
const PAGE_SIZE = 10
const partnerStatuses = ['PENDING', 'APPROVED', 'REJECTED']
const ticketStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
const dateText = value => value && !Number.isNaN(Date.parse(value))
  ? new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  : '—'
const statusText = value => String(value || 'UNKNOWN').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase())
const titleCase = value => String(value || '—').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase())

const modes = {
  requests: { load: getAdminRequests, update: updateAdminRequestStatus, statuses: requestStatuses },
  partners: { load: getAdminPartners, update: updateAdminPartnerStatus, statuses: partnerStatuses },
  tickets: { load: getAdminTickets, update: updateAdminTicketStatus, statuses: ticketStatuses },
}

function recordLabel(record, source) {
  if (source === 'partners') return record.businessName || record.name || `Application ${record.id}`
  if (source === 'tickets') return record.topic || `Ticket ${record.id}`
  return `${titleCase(record.serviceType)} request`
}

function detailText(record, source) {
  if (source === 'requests') {
    if (typeof record.details === 'string') {
      try { return JSON.stringify(JSON.parse(record.details), null, 2) } catch { return record.details }
    }
    return JSON.stringify(record.details || {}, null, 2)
  }
  return source === 'partners' ? `${record.name || ''}\n${record.partnerType || ''}\n${record.phone || ''}\n${record.email || ''}\n${record.location || ''}` : record.message || ''
}

export default function AdminRecordsPage({ title, description, source, serviceType, partnerTypes, singular }) {
  const session = readAuthSession()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [pendingChange, setPendingChange] = useState(null)
  const [saving, setSaving] = useState(false)
  const config = modes[source]

  const loadRecords = async (signal) => {
    setLoading(true)
    setError('')
    try {
      const result = await config.load(session?.accessToken, signal)
      const values = Array.isArray(result) ? result : []
      const filtered = serviceType ? values.filter(record => String(record.serviceType || '').toUpperCase() === serviceType) : values
      setRecords(partnerTypes ? filtered.filter(record => partnerTypes.some(type => String(record.partnerType || '').toLowerCase().includes(type))) : filtered)
    } catch (requestError) {
      if (requestError.name !== 'AbortError') setError(requestError.status === 401 || requestError.status === 403
        ? 'Your administrator session has expired or does not have permission for this area.'
        : requestError.message || `Could not load ${singular}.`)
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    loadRecords(controller.signal)
    // A page mount represents one module; mutations trigger an explicit refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredRecords = useMemo(() => records.filter(record => {
    const matchesStatus = statusFilter === 'ALL' || String(record.status || '').toUpperCase() === statusFilter
    const search = query.trim().toLowerCase()
    const fields = source === 'partners'
      ? [record.name, record.businessName, record.partnerType, record.phone, record.email, record.location]
      : source === 'tickets'
        ? [record.id, record.name, record.contact, record.topic, record.message, record.status]
        : [record.id, record.userId, record.serviceType, record.status, record.details]
    return matchesStatus && (!search || fields.some(value => String(value || '').toLowerCase().includes(search)))
  }), [records, query, statusFilter, source])

  const openCount = records.filter(record => ['PENDING', 'OPEN', 'REQUESTED', 'CONFIRMED'].includes(String(record.status || '').toUpperCase())).length
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE))
  const visibleRecords = filteredRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const statusCounts = records.reduce((counts, record) => {
    const status = String(record.status || 'UNKNOWN').toUpperCase()
    counts[status] = (counts[status] || 0) + 1
    return counts
  }, {})

  const confirmStatusChange = async () => {
    if (!pendingChange) return
    setSaving(true)
    setError('')
    try {
      await config.update(pendingChange.record.id, pendingChange.status, session?.accessToken)
      setPendingChange(null)
      setPage(1)
      await loadRecords()
    } catch (requestError) {
      setError(requestError.message || 'The update could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  return <AdminLayout title={title} description={description}>
    <div className="admin-records-page">
      {error && <div className="admin-records-alert" role="alert"><AdminIcon name="shield" size={18}/><p>{error}</p><button type="button" onClick={() => loadRecords()}>Retry</button></div>}

      <section className="admin-records-summary" aria-label={`${title} summary`}>
        <article><span className="admin-records-summary-icon blue"><AdminIcon name={source === 'partners' ? 'driver' : source === 'tickets' ? 'help' : 'clipboard'}/></span><div><small>Total {title}</small><b>{loading ? '—' : records.length.toLocaleString('en-BD')}</b><span>Records returned by the service</span></div></article>
        <article><span className="admin-records-summary-icon orange"><AdminIcon name="bell"/></span><div><small>Needs attention</small><b>{loading ? '—' : openCount.toLocaleString('en-BD')}</b><span>Pending or open status</span></div></article>
        <article><span className="admin-records-summary-icon green"><AdminIcon name="shield"/></span><div><small>Completed / resolved</small><b>{loading ? '—' : (statusCounts.COMPLETED || statusCounts.RESOLVED || statusCounts.APPROVED || 0).toLocaleString('en-BD')}</b><span>Based on current status</span></div></article>
      </section>

      <section className="admin-records-panel">
        <div className="admin-records-panel-head"><div><h2>{singular} activity</h2><p>Review live records and apply supported status updates.</p></div><span className="admin-records-live">Connected to backend</span></div>
        <div className="admin-records-toolbar"><label className="admin-records-search"><AdminIcon name="search" size={17}/><input value={query} onChange={event => { setQuery(event.target.value); setPage(1) }} placeholder={`Search ${singular.toLowerCase()}…`} aria-label={`Search ${singular}`}/></label><label className="admin-records-status"><span className="sr-only">Filter status</span><select value={statusFilter} onChange={event => { setStatusFilter(event.target.value); setPage(1) }}><option value="ALL">All statuses</option>{config.statuses.map(status => <option value={status} key={status}>{statusText(status)}</option>)}</select><AdminIcon name="chevron" size={15}/></label><button className="admin-records-reset" type="button" onClick={() => { setQuery(''); setStatusFilter('ALL'); setPage(1) }}><AdminIcon name="close" size={15}/>Reset</button></div>

        <div className="admin-records-table-scroll"><table className="admin-records-table"><thead><tr>{source === 'partners' ? <><th>Applicant / Business</th><th>Partner type</th><th>Phone</th><th>Location</th><th>Applied</th><th>Status</th><th>Actions</th></> : source === 'tickets' ? <><th>Ticket</th><th>Customer</th><th>Contact</th><th>Received</th><th>Status</th><th>Actions</th></> : <><th>Reference</th><th>Service</th><th>Customer ID</th><th>Amount</th><th>Requested</th><th>Status</th><th>Actions</th></>}</tr></thead><tbody>
          {loading && Array.from({ length: 5 }, (_, index) => <tr className="admin-records-skeleton" key={index}><td colSpan="7"><i/></td></tr>)}
          {!loading && visibleRecords.map(record => <tr key={record.id}>
            {source === 'partners' ? <><td><b>{record.businessName || 'Individual applicant'}</b><small>{record.name || 'Name not provided'} · #{record.id}</small></td><td>{titleCase(record.partnerType)}</td><td>{record.phone || '—'}</td><td>{record.location || '—'}</td><td>{dateText(record.createdAt)}</td><td><span className={`admin-record-status ${String(record.status || '').toLowerCase()}`}>{statusText(record.status)}</span></td></> : source === 'tickets' ? <><td><b>#{record.id} · {record.topic || 'Support request'}</b><small>{record.message || 'No message provided'}</small></td><td>{record.name || '—'}</td><td>{record.contact || '—'}</td><td>{dateText(record.createdAt)}</td><td><span className={`admin-record-status ${String(record.status || '').toLowerCase()}`}>{statusText(record.status)}</span></td></> : <><td><b>#{record.id}</b><small>{record.details ? 'Open details for request information' : 'Request record'}</small></td><td>{titleCase(record.serviceType)}</td><td>{record.userId ? `User #${record.userId}` : '—'}</td><td>{record.amount == null ? '—' : `৳ ${Number(record.amount).toLocaleString('en-BD')}`}</td><td>{dateText(record.createdAt)}</td><td><span className={`admin-record-status ${String(record.status || '').toLowerCase()}`}>{statusText(record.status)}</span></td></>}
            <td><div className="admin-record-actions"><button type="button" onClick={() => setSelectedRecord(record)} aria-label={`View ${singular.toLowerCase()} ${record.id}`} title="View details"><AdminIcon name="search" size={16}/></button><select aria-label={`Update status for ${singular.toLowerCase()} ${record.id}`} value={record.status || ''} onChange={event => event.target.value && event.target.value !== record.status && setPendingChange({ record, status: event.target.value })}><option value="" disabled>Status</option>{config.statuses.map(status => <option value={status} key={status}>{statusText(status)}</option>)}</select></div></td>
          </tr>)}
          {!loading && filteredRecords.length === 0 && <tr><td colSpan="7"><div className="admin-records-empty"><span><AdminIcon name={source === 'tickets' ? 'help' : source === 'partners' ? 'driver' : 'clipboard'} size={24}/></span><b>{records.length ? 'No records match your filters' : `No ${singular.toLowerCase()} records yet`}</b><p>{records.length ? 'Change the search or status filter to see more.' : 'New activity will appear here when it is submitted.'}</p></div></td></tr>}
        </tbody></table></div>
        <div className="admin-records-foot"><span>{filteredRecords.length ? `Showing ${((page - 1) * PAGE_SIZE) + 1}–${Math.min(page * PAGE_SIZE, filteredRecords.length)} of ${filteredRecords.length.toLocaleString('en-BD')}` : 'Showing 0'} of {records.length.toLocaleString('en-BD')} records</span><div className="admin-records-pagination"><button type="button" disabled={page <= 1 || loading} aria-label="Previous page" onClick={() => setPage(value => Math.max(1, value - 1))}>‹</button><span>Page {page} of {totalPages}</span><button type="button" disabled={page >= totalPages || loading} aria-label="Next page" onClick={() => setPage(value => Math.min(totalPages, value + 1))}>›</button></div></div>
      </section>
    </div>

    {selectedRecord && <div className="admin-record-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setSelectedRecord(null) }}><section className="admin-record-modal" role="dialog" aria-modal="true" aria-labelledby="admin-record-modal-title"><button className="admin-record-modal-close" type="button" onClick={() => setSelectedRecord(null)} aria-label="Close details">×</button><span className="admin-record-modal-kicker">{singular.toUpperCase()} DETAILS</span><h2 id="admin-record-modal-title">{recordLabel(selectedRecord, source)}</h2><div className="admin-record-modal-meta"><span>Reference <b>#{selectedRecord.id}</b></span><span>Status <b>{statusText(selectedRecord.status)}</b></span><span>Created <b>{dateText(selectedRecord.createdAt)}</b></span>{selectedRecord.amount != null && <span>Amount <b>৳ {Number(selectedRecord.amount).toLocaleString('en-BD')}</b></span>}</div><pre>{detailText(selectedRecord, source) || 'No additional details supplied.'}</pre><button className="admin-record-modal-done" type="button" onClick={() => setSelectedRecord(null)}>Close</button></section></div>}
    {pendingChange && <div className="admin-record-modal-backdrop" role="presentation"><section className="admin-record-confirm" role="alertdialog" aria-modal="true" aria-labelledby="admin-record-confirm-title"><span className="admin-record-confirm-icon"><AdminIcon name="shield" size={22}/></span><h2 id="admin-record-confirm-title">Change this status?</h2><p>Update {singular.toLowerCase()} #{pendingChange.record.id} from <b>{statusText(pendingChange.record.status)}</b> to <b>{statusText(pendingChange.status)}</b>. This change will be saved to the backend.</p><div><button type="button" className="admin-record-cancel" disabled={saving} onClick={() => setPendingChange(null)}>Cancel</button><button type="button" className="admin-record-confirm-button" disabled={saving} onClick={confirmStatusChange}>{saving ? 'Saving…' : 'Confirm update'}</button></div></section></div>}
  </AdminLayout>
}
