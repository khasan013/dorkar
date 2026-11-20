import AdminUnavailablePage from './AdminUnavailablePage'

export default function PaymentsPage() {
  return <AdminUnavailablePage title="Payments & Transactions" description="Review transaction records, payment outcomes, and refunds." icon="card" capabilities={[{"title":"Transaction records","description":"Filter successful, pending, and failed payments by date and service."},{"title":"Refund review","description":"Review refund requests and connect each decision to an audit trail."},{"title":"Settlements","description":"Track provider settlements and platform commissions from verified totals."}]}/>
}
