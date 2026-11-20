import AdminUnavailablePage from './AdminUnavailablePage'

export default function SystemLogsPage() {
  return <AdminUnavailablePage title="System Logs" description="Review administrator activity and system events." icon="clipboard" capabilities={[{"title":"Admin activity","description":"Who performed an administrative change and when it happened."},{"title":"Operational events","description":"Service errors and important platform events with their context."},{"title":"Audit history","description":"Searchable, access-controlled records for sensitive actions."}]}/>
}
