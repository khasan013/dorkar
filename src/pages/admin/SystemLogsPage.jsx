import { useCallback, useEffect, useMemo, useState } from 'react'
import { readAuthSession } from '../../auth/session'
import { exportAdminLogs, getAdminLog, getAdminLogSummary, getAdminLogs } from '../../services/adminApi'
import AdminLayout, { AdminIcon } from './AdminLayout'
import './SystemLogsPage.css'

const tabs = [
  ['ALL', 'All Events'],
  ['ADMIN_ACTIVITY', 'Admin Activity'],
  ['OPERATIONAL', 'Operational Events'],
  ['SECURITY', 'Security Logs'],
  ['AUDIT_HISTORY', 'Audit History'],
]
const fmt = (date) => date ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(new Date(date)) : '—'
const actorLabel = (row) => row.actorName || row.actorRole || 'System'

export default function SystemLogsPage() {
  const token = readAuthSession()?.accessToken
  const [tab, setTab] = useState('ALL')
  const [search, setSearch] = useState('')
  const [type, setType] = useState('ALL')
  const [severity, setSeverity] = useState('ALL')
  const [actor, setActor] = useState('ALL')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [sortDirection, setSortDirection] = useState('DESC')
  const [from, setFrom] = useState(() => new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10))
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [summary, setSummary] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [notice, setNotice] = useState('')

  const filters = useMemo(() => ({
    page, size, sortDirection, search: search.trim(), eventType: type === 'ALL' ? '' : type,
    category: tab === 'ALL' ? '' : tab, severity: severity === 'ALL' ? '' : severity,
    actorId: actor === 'ALL' ? '' : actor, from, to,
  }), [page, size, search, type, tab, severity, actor, from, to])

  const load = useCallback((signal) => {
    setLoading(true)
    setError('')
    return Promise.all([getAdminLogs(filters, token, signal), getAdminLogSummary({ from, to }, token, signal)])
      .then(([logs, metrics]) => { setResult(logs); setSummary(metrics || {}) })
      .catch((requestError) => { if (requestError.name !== 'AbortError') setError(requestError.message || 'We couldn’t load system logs.') })
      .finally(() => { if (!signal?.aborted) setLoading(false) })
  }, [filters, from, to, token])

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => load(controller.signal), search ? 250 : 0)
    const interval = window.setInterval(() => load(controller.signal), 30000)
    return () => { window.clearTimeout(timer); window.clearInterval(interval); controller.abort() }
  }, [load])

  const rows = result?.content || result?.items || []
  const total = Number(result?.totalElements ?? result?.total ?? rows.length)
  const totalPages = Number(result?.totalPages ?? Math.ceil(total / size))
  const actors = result?.actors || []

  function resetFilters() {
    setTab('ALL'); setType('ALL'); setSeverity('ALL'); setActor('ALL'); setSearch(''); setPage(0); setSortDirection('DESC')
    setFrom(new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10)); setTo(new Date().toISOString().slice(0, 10))
  }

  async function openDetails(row) {
    setSelected(row); setDetailLoading(true)
    try { setSelected(await getAdminLog(row.id, token)) }
    catch (requestError) { setNotice(requestError.message || 'Could not load event details.') }
    finally { setDetailLoading(false) }
  }

  async function downloadCsv() {
    setExporting(true); setNotice('')
    try {
      const blob = await exportAdminLogs(filters, token)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a'); link.href = url; link.download = 'dorkar-system-logs.csv'; link.click(); URL.revokeObjectURL(url)
    } catch (requestError) { setNotice(requestError.message || 'CSV export failed.') }
    finally { setExporting(false) }
  }

  const cards = [
    { title: 'Total Events', value: summary?.totalEvents, delta: summary?.totalChange, icon: 'layers', tone: 'red' },
    { title: 'Admin Activities', value: summary?.adminActivities, delta: summary?.adminChange, icon: 'users', tone: 'blue' },
    { title: 'System Errors', value: summary?.systemErrors, delta: summary?.errorChange, icon: 'alert', tone: 'orange' },
    { title: 'Security Alerts', value: summary?.securityAlerts, delta: summary?.securityChange, icon: 'shield', tone: 'purple' },
  ]

  return <AdminLayout title="System Logs" description="System monitoring & audit center. Track administrator activities, system events, and security logs.">
    <div className="admin-logs-page">
      <div className="admin-logs-toolbar-top">
        <span className={`admin-logs-live ${error ? 'is-error' : ''}`}><i/>{error ? 'Connection issue' : loading && !result ? 'Connecting…' : 'Live Monitoring'}</span>
        <label className="admin-logs-date"><span>Date range</span><input aria-label="Start date" type="date" value={from} max={to} onChange={e => { setFrom(e.target.value); setPage(0) }}/><b>–</b><input aria-label="End date" type="date" value={to} min={from} max={new Date().toISOString().slice(0, 10)} onChange={e => { setTo(e.target.value); setPage(0) }}/></label>
      </div>

      <section className="admin-logs-kpis" aria-label="Log summary">
        {cards.map(card => <article className={`admin-logs-kpi tone-${card.tone}`} key={card.title}>
          <span className="admin-logs-kpi-icon"><AdminIcon name={card.icon} size={21}/></span><div><small>{card.title}</small><strong>{loading && card.value == null ? <i className="admin-logs-skeleton-value"/> : (card.value ?? '—')}</strong><p>{card.delta == null ? 'No comparison data' : <><b className={Number(card.delta) < 0 ? 'negative' : ''}>{Number(card.delta) > 0 ? '+' : ''}{card.delta}%</b> from previous period</>}</p></div><span className="admin-logs-spark" aria-hidden="true">⌁⌁</span>
        </article>)}
      </section>

      <section className="admin-logs-panel">
        <nav className="admin-logs-tabs" aria-label="Event categories">{tabs.map(([key, label]) => <button type="button" className={tab === key ? 'is-active' : ''} key={key} onClick={() => { setTab(key); setPage(0) }}>{label}</button>)}</nav>
        <div className="admin-logs-filters">
          <label className="admin-logs-search"><AdminIcon name="search" size={17}/><input value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} placeholder="Search logs by action, user, or details..."/></label>
          <label><span>Event type</span><select value={type} onChange={e => { setType(e.target.value); setPage(0) }}><option value="ALL">All Types</option>{['ADMIN_ACTIVITY','OPERATIONAL','SECURITY','AUDIT_HISTORY'].map(value => <option key={value} value={value}>{value.replaceAll('_',' ')}</option>)}</select></label>
          <label><span>Severity</span><select value={severity} onChange={e => { setSeverity(e.target.value); setPage(0) }}><option value="ALL">All Severities</option>{['INFO','WARNING','ERROR','CRITICAL'].map(value => <option key={value} value={value}>{value}</option>)}</select></label>
          <label><span>Admin / User</span><select value={actor} onChange={e => { setActor(e.target.value); setPage(0) }}><option value="ALL">All Users</option>{actors.map(item => <option value={item.id} key={item.id}>{item.name} · {item.role}</option>)}</select></label>
          <button type="button" className="admin-logs-reset" onClick={resetFilters}><AdminIcon name="refresh" size={16}/>Reset</button>
          <button type="button" className="admin-logs-export" disabled={exporting || loading} onClick={downloadCsv}><AdminIcon name="download" size={16}/>{exporting ? 'Exporting…' : 'Export CSV'}</button>
        </div>
        {notice && <div className="admin-logs-notice" role="status">{notice}<button type="button" onClick={() => setNotice('')}>Dismiss</button></div>}
        {error ? <div className="admin-logs-state admin-logs-error"><AdminIcon name="alert"/><div><b>We couldn’t load system logs</b><p>{error}</p></div><button type="button" onClick={() => load()}>Retry</button></div> : <>
          <div className="admin-logs-table-scroll"><table className="admin-logs-table"><thead><tr><th>#</th><th><button type="button" className="admin-logs-sort" onClick={() => { setSortDirection(value => value === 'DESC' ? 'ASC' : 'DESC'); setPage(0) }}>Time {sortDirection === 'DESC' ? '↓' : '↑'}</button></th><th>Actor</th><th>Event / Action</th><th>Category</th><th>Severity</th><th>IP Address</th><th>Details</th><th>Actions</th></tr></thead>
            <tbody>{loading ? Array.from({length: Math.min(size, 6)}, (_, index) => <tr key={`loading-${index}`} className="admin-logs-loading-row"><td colSpan="9"><i/></td></tr>) : rows.map((row, index) => <tr key={row.id}>
              <td>{page * size + index + 1}</td><td className="admin-logs-time">{fmt(row.createdAt || row.timestamp)}</td>
              <td><div className="admin-logs-actor"><span>{actorLabel(row).split(/\s+/).map(word => word[0]).join('').slice(0,2).toUpperCase()}</span><div><b>{actorLabel(row)}</b><small>{row.actorRole || row.source || 'System'}</small></div></div></td>
              <td><b className="admin-logs-action-title">{row.title || row.action || 'Event'}</b><small className="admin-logs-action-desc">{row.description || '—'}</small></td>
              <td><span className={`admin-logs-category category-${String(row.eventType || row.category || '').toLowerCase()}`}>{String(row.eventType || row.category || 'SYSTEM').replaceAll('_',' ')}</span></td>
              <td><span className={`admin-logs-severity severity-${String(row.severity || 'INFO').toLowerCase()}`}>{row.severity || 'INFO'}</span></td>
              <td>{row.ipAddress || '—'}</td><td className="admin-logs-details">{row.entityType ? `${row.entityType}${row.entityId ? ` · ${row.entityId}` : ''}` : row.requestId || '—'}</td>
              <td><button type="button" className="admin-logs-view" onClick={() => openDetails(row)}><AdminIcon name="eye" size={14}/>View</button></td>
            </tr>)}</tbody>
          </table>{!loading && rows.length === 0 && <div className="admin-logs-empty"><span><AdminIcon name="clipboard" size={22}/></span><b>No events found for these filters</b><p>Try a different search or clear the selected filters.</p><button type="button" onClick={resetFilters}>Clear filters</button></div>}</div>
          <footer className="admin-logs-pagination"><span>Showing {total === 0 ? 0 : page * size + 1}–{Math.min((page + 1) * size, total)} of {total.toLocaleString()} events</span><label>Rows per page<select value={size} onChange={e => { setSize(Number(e.target.value)); setPage(0) }}>{[10,25,50,100].map(value => <option key={value}>{value}</option>)}</select></label><div><button type="button" disabled={page <= 0 || loading} onClick={() => setPage(page - 1)} aria-label="Previous page">‹</button><span>{totalPages ? `${page + 1} / ${totalPages}` : '0 / 0'}</span><button type="button" disabled={page + 1 >= totalPages || loading} onClick={() => setPage(page + 1)} aria-label="Next page">›</button></div></footer>
        </>}
      </section>
    </div>
    {selected && <div className="admin-logs-drawer-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setSelected(null) }}><aside className="admin-logs-drawer" role="dialog" aria-modal="true" aria-labelledby="admin-log-detail-title"><header><div><small>EVENT DETAILS</small><h2 id="admin-log-detail-title">{selected.title || selected.action || 'System event'}</h2></div><button type="button" aria-label="Close details" onClick={() => setSelected(null)}>×</button></header>{detailLoading ? <div className="admin-logs-drawer-loading">Loading event details…</div> : <><p className="admin-logs-drawer-description">{selected.description || 'No additional description was recorded.'}</p><dl>{[['Event ID', selected.id],['Timestamp', fmt(selected.createdAt || selected.timestamp)],['Category', selected.eventType || selected.category],['Severity', selected.severity],['Actor', actorLabel(selected)],['Actor email', selected.actorEmail],['Actor role', selected.actorRole],['Actor ID', selected.actorId],['Related entity', selected.entityType],['Entity ID', selected.entityId],['Request ID', selected.requestId],['IP address', selected.ipAddress],['User agent', selected.userAgent],['Error code', selected.errorCode],['Error details', selected.errorDetails]].filter(([,value]) => value != null && value !== '').map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{String(value)}</dd></div>)}</dl>{selected.metadata && <section className="admin-logs-metadata"><b>Metadata</b><pre>{typeof selected.metadata === 'string' ? selected.metadata : JSON.stringify(selected.metadata, null, 2)}</pre></section>}</>}</aside></div>}
  </AdminLayout>
}
