import { useCallback, useEffect, useState } from 'react'
import { readAuthSession } from '../../auth/session'
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../../services/notificationApi'
import './NotificationsPage.css'

const dateLabel = value => {
  if (!value) return 'Just now'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Just now' : new Intl.DateTimeFormat('en-BD', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export default function NotificationsPage() {
  const token = readAuthSession()?.accessToken
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const unreadCount = items.filter(item => !item.read).length

  const load = useCallback(async signal => {
    if (!token) { setItems([]); setError('Sign in to see updates for your account.'); setLoading(false); return }
    try {
      setError('')
      const notifications = await getNotifications(token, signal)
      if (!signal?.aborted) setItems(notifications)
    } catch (reason) {
      if (!signal?.aborted) setError(reason.message || 'Could not load notifications.')
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [token])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  const markOne = async item => {
    if (item.read || busy) return
    setBusy(true)
    try { await markNotificationRead(token, item.id); setItems(current => current.map(row => row.id === item.id ? { ...row, read: true } : row)); window.dispatchEvent(new Event('dorkar-notification-change')) }
    catch (reason) { setError(reason.message || 'Could not update this notification.') }
    finally { setBusy(false) }
  }

  const markAll = async () => {
    if (!unreadCount || busy) return
    setBusy(true)
    try { await markAllNotificationsRead(token); setItems(current => current.map(item => ({ ...item, read: true }))); window.dispatchEvent(new Event('dorkar-notification-change')) }
    catch (reason) { setError(reason.message || 'Could not update notifications.') }
    finally { setBusy(false) }
  }

  return <main className="notifications-page">
    <header className="notifications-heading">
      <div><span className="notifications-kicker">YOUR ACCOUNT</span><h1>Notifications</h1><p>Service updates and important messages from Dorkar.</p></div>
      <button type="button" className="notifications-mark-all" onClick={markAll} disabled={!unreadCount || busy}>{busy ? 'Updating…' : 'Mark all as read'}</button>
    </header>
    {error && <div className="notifications-error" role="alert"><span>{error}</span>{token && <button type="button" onClick={() => { setLoading(true); load() }}>Try again</button>}</div>}
    <section className="notifications-list" aria-live="polite">
      {loading && <div className="notifications-empty"><span className="notifications-spinner"/><b>Loading notifications…</b></div>}
      {!loading && !error && items.length === 0 && <div className="notifications-empty"><span className="notifications-empty-icon">✓</span><b>You’re all caught up</b><p>New account and service updates will appear here.</p></div>}
      {!loading && items.map(item => <article key={item.id} className={`notification-row${item.read ? '' : ' is-unread'}`}>
        <span className="notification-type-icon" aria-hidden="true">{item.type?.toUpperCase().includes('FOOD') ? '🍽' : item.type?.toUpperCase().includes('RIDE') ? '↗' : item.type?.toUpperCase().includes('BLOOD') ? '♥' : '◈'}</span>
        <div className="notification-copy"><div className="notification-title-line"><h2>{item.title || 'Dorkar update'}</h2>{!item.read && <span className="notification-unread-label">New</span>}</div><p>{item.message}</p><time dateTime={item.createdAt || undefined}>{dateLabel(item.createdAt)}</time></div>
        {!item.read && <button type="button" className="notification-read-button" disabled={busy} onClick={() => markOne(item)}>Mark read</button>}
      </article>)}
    </section>
  </main>
}
