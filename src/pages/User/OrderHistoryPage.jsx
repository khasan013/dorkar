import { useEffect, useState } from 'react'
import { readAuthSession } from '../../auth/session'
import { getOrderHistory } from '../../services/orderHistoryApi'
import './OrderHistoryPage.css'

const formatService = (value = '') => String(value).toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase())
const formatDate = value => {
  if (!value) return 'Date unavailable'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat('en-BD', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}
const formatAmount = value => value == null ? '—' : `৳ ${Number(value).toLocaleString('en-BD')}`
const getDescription = details => {
  if (!details || typeof details !== 'object') return 'Service request'
  return details.restaurantName || details.restaurant || details.destination || details.dropoffAddress || details.deliveryAddress || details.pickupAddress || details.description || 'Service request'
}

export default function OrderHistoryPage() {
  const token = readAuthSession()?.accessToken
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    getOrderHistory(token, controller.signal)
      .then(setOrders)
      .catch(reason => { if (!controller.signal.aborted) setError(reason.message || 'Could not load order history.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [token])

  return <main className="order-history-page">
    <header className="order-history-heading">
      <span className="order-history-kicker">YOUR ACCOUNT</span>
      <h1>Order History</h1>
      <p>Review your rides, food orders, and parcel requests in one place.</p>
    </header>
    <section className="order-history-card" aria-live="polite">
      {loading && <div className="order-history-state"><span className="order-history-loader"/><b>Loading your history…</b></div>}
      {!loading && error && <div className="order-history-state"><b>We couldn’t load your order history</b><p>{error}</p><button type="button" onClick={() => window.location.reload()}>Try again</button></div>}
      {!loading && !error && orders.length === 0 && <div className="order-history-state"><span className="order-history-empty-icon">↗</span><b>No orders yet</b><p>Your completed and in-progress service requests will appear here.</p><a href="/services">Explore Dorkar services</a></div>}
      {!loading && !error && orders.length > 0 && <>
        <div className="order-history-card-heading"><div><h2>Recent activity</h2><p>{orders.length} {orders.length === 1 ? 'record' : 'records'}</p></div></div>
        <div className="order-history-table-scroll"><table className="order-history-table"><thead><tr><th>Service</th><th>Details</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead><tbody>{orders.map(order => <tr key={`${order.serviceType}-${order.id}`}>
          <td><span className={`order-history-service service-${String(order.serviceType || '').toLowerCase()}`}>{formatService(order.serviceType)}</span><small>#{order.id}</small></td>
          <td>{getDescription(order.details)}</td>
          <td>{formatDate(order.createdAt)}</td>
          <td>{formatAmount(order.amount)}</td>
          <td><span className={`order-history-status status-${String(order.status || '').toLowerCase()}`}>{formatService(order.status)}</span></td>
        </tr>)}</tbody></table></div>
      </>}
    </section>
  </main>
}
