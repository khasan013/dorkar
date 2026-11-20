import { useEffect, useMemo, useState } from 'react'
import { readAuthSession } from '../../auth/session'
import { getAdminDashboard, getAdminRequests } from '../../services/adminApi'
import AdminLayout, { AdminIcon } from './AdminLayout'
import './ReportsPage.css'

const services = [
  ['RIDE', 'Ride Sharing', 'car', '#2388f5'],
  ['FOOD', 'Food Delivery', 'food', '#ff941f'],
  ['PARCEL', 'Parcel Delivery', 'box', '#a338f5'],
  ['BLOOD_DONATION', 'Blood Donation', 'blood', '#ef233c'],
]

export default function ReportsPage() {
  const token = readAuthSession()?.accessToken
  const [summary, setSummary] = useState(null)
  const [requests, setRequests] = useState([])
  const [range, setRange] = useState('30')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([getAdminDashboard(token, controller.signal), getAdminRequests(token, controller.signal)])
      .then(([metrics, list]) => {
        setSummary(metrics || {})
        setRequests(Array.isArray(list) ? list : [])
      })
      .catch(requestError => {
        if (requestError.name !== 'AbortError') setError(requestError.message || 'Reports could not be loaded.')
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [token])

  const periodRequests = useMemo(() => {
    if (range === 'all') return requests
    const cutoff = Date.now() - Number(range) * 86400000
    return requests.filter(row => Date.parse(row.createdAt || '') >= cutoff)
  }, [requests, range])
  const totals = services.map(([key, title, icon, color]) => ({
    key, title, icon, color,
    count: periodRequests.filter(row => String(row.serviceType || '').toUpperCase() === key).length,
  }))
  const max = Math.max(1, ...totals.map(item => item.count))
  const period = range === 'all' ? 'All available records' : 'Last ' + range + ' days'
  const recent = [...periodRequests].sort((a, b) => Date.parse(b.createdAt || '') - Date.parse(a.createdAt || '')).slice(0, 8)

  return <AdminLayout title="Reports & Analytics" description="Review platform activity from verified Dorkar admin data.">
    <div className="admin-reports-page">
      {error && <div className="admin-reports-alert" role="alert"><AdminIcon name="shield" size={18}/><p>{error}</p><button type="button" onClick={() => window.location.reload()}>Retry</button></div>}
      <section className="admin-reports-toolbar"><div><span>REPORTING PERIOD</span><b>{period}</b></div><label><span className="sr-only">Reporting period</span><select value={range} onChange={event => setRange(event.target.value)}><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="all">All records</option></select><AdminIcon name="chevron" size={15}/></label></section>
      <section className="admin-reports-kpis" aria-label="Platform report summary">
        {[['users','Registered users',summary?.users],['clipboard','Service requests',periodRequests.length],['driver','Partner applications',summary?.partners],['help','Support tickets',summary?.supportTickets]].map(([icon,label,value])=><article key={label}><span><AdminIcon name={icon} size={19}/></span><div><small>{label}</small><b>{loading || value == null ? '—' : Number(value).toLocaleString('en-BD')}</b><i>{label === 'Service requests' ? period : 'All available records'}</i></div></article>)}
      </section>
      <section className="admin-reports-main-grid">
        <article className="admin-reports-panel"><div className="admin-reports-panel-heading"><div><h2>Requests by service</h2><p>Counts for {period.toLowerCase()}; blood requests shown separately.</p></div></div>
          {loading ? <div className="admin-reports-loading"><i/><i/><i/><i/></div> : <div className="admin-reports-bars">{totals.map(item=><div className="admin-reports-bar-row" key={item.key}><div className="admin-reports-bar-label"><span style={{color:item.color}}><AdminIcon name={item.icon} size={17}/></span><b>{item.title}</b><strong>{item.count.toLocaleString('en-BD')}</strong></div><div className="admin-reports-bar-track"><i style={{width:Math.max(item.count ? 4 : 0, item.count / max * 100) + '%',background:item.color}}/></div></div>)}</div>}
          <p className="admin-reports-footnote">Counts reflect records returned by the current admin API. The backend does not currently expose revenue, payment, or period-comparison data.</p>
        </article>
        <article className="admin-reports-panel admin-reports-coverage"><span className="admin-reports-coverage-icon"><AdminIcon name="chart" size={22}/></span><div><span className="admin-reports-eyebrow">DATA COVERAGE</span><h2>Operational metrics</h2><p>Available: user, request, partner, and support counts. Revenue, transaction, export, and previous-period data are not available in the admin API.</p></div><div className="admin-reports-coverage-list"><span><i className="available"/>Users and requests</span><span><i className="available"/>Partners and support</span><span><i/>Revenue and settlements</span><span><i/>Period comparisons</span></div></article>
      </section>
      <section className="admin-reports-panel admin-reports-table-panel"><div className="admin-reports-panel-heading"><div><h2>Recent service activity</h2><p>Latest requests returned by the admin service.</p></div><span className="admin-reports-count">{loading ? '—' : periodRequests.length.toLocaleString('en-BD')} records</span></div><div className="admin-reports-table-scroll"><table><thead><tr><th>Reference</th><th>Service</th><th>Amount</th><th>Status</th><th>Received</th></tr></thead><tbody>
        {loading && Array.from({length:4},(_,index)=><tr key={index} className="admin-reports-skeleton"><td colSpan="5"><i/></td></tr>)}
        {!loading && recent.map(row=>{const service=services.find(item=>item[0]===String(row.serviceType||'').toUpperCase());return <tr key={row.id}><td><b>#{row.id}</b></td><td>{service?.[1] || 'Service'}</td><td>{row.amount == null ? '—' : '৳ ' + Number(row.amount).toLocaleString('en-BD')}</td><td><span className={'admin-reports-status ' + String(row.status||'').toLowerCase()}>{String(row.status||'Unknown').replaceAll('_',' ')}</span></td><td>{row.createdAt && !Number.isNaN(Date.parse(row.createdAt)) ? new Intl.DateTimeFormat('en',{dateStyle:'medium'}).format(new Date(row.createdAt)) : '—'}</td></tr>})}
        {!loading && !periodRequests.length && <tr><td colSpan="5"><div className="admin-reports-empty">No service activity is available for this period.</div></td></tr>}
      </tbody></table></div></section>
    </div>
  </AdminLayout>
}
