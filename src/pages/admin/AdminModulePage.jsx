import AdminLayout from './AdminLayout'
import './DashboardPage.css'

export default function AdminModulePage({ title, description }) {
  return <AdminLayout title={title} description={description}>
    <section className="admin-scaffold-panel" aria-label={`${title} page scaffold`}>
      <div className="admin-scaffold-toolbar"><span className="admin-scaffold-label">PAGE LAYOUT READY</span><span className="admin-scaffold-chip">UI design pending</span></div>
      <div className="admin-scaffold-copy"><h2>{title}</h2><p>{description} This page has its own route and shared admin navigation, ready for its detailed interface.</p></div>
      <div className="admin-scaffold-placeholder" aria-hidden="true"><span/><span/><span/></div>
    </section>
  </AdminLayout>
}
