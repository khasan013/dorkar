import AdminLayout, { AdminIcon } from './AdminLayout'
import './AdminUnavailablePage.css'

export default function AdminUnavailablePage({ title, description, icon = 'settings', capabilities = [] }) {
  return <AdminLayout title={title} description={description}>
    <div className="admin-unavailable-page">
      <section className="admin-unavailable-hero"><span className="admin-unavailable-icon"><AdminIcon name={icon} size={24}/></span><div><span className="admin-unavailable-kicker">ADMIN WORKSPACE</span><h2>{title}</h2><p>{description}</p></div><span className="admin-unavailable-state">API not connected</span></section>
      <section className="admin-unavailable-grid" aria-label={`${title} tools`}>
        {capabilities.map((item, index) => <article key={item.title}><span className={`admin-unavailable-step step-${index + 1}`}>0{index + 1}</span><div><h3>{item.title}</h3><p>{item.description}</p></div><span className="admin-unavailable-check">—</span></article>)}
      </section>
      <section className="admin-unavailable-empty"><span><AdminIcon name={icon} size={25}/></span><div><span className="admin-unavailable-kicker">WAITING FOR BACKEND SUPPORT</span><h3>This workspace is ready for live data</h3><p>The current backend does not expose the administrator endpoints needed for this module. No sample records or pretend controls are shown here.</p></div></section>
    </div>
  </AdminLayout>
}
