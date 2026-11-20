import AdminUnavailablePage from './AdminUnavailablePage'

export default function AdminRolesPage() {
  return <AdminUnavailablePage title="Admin Role & Access" description="Review administrator roles and permission boundaries." icon="shield" capabilities={[{"title":"Super Admin","description":"Full platform administration, subject to backend authorization."},{"title":"Operations Admin","description":"Service operations, partner onboarding, and booking workflows."},{"title":"Finance and Support","description":"Restricted access to finance or customer support workflows."}]}/>
}
