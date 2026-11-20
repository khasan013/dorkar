import AdminRecordsPage from './AdminRecordsPage'

export default function DriversPage() {
  return <AdminRecordsPage title="Drivers & Delivery" description="Review ride and delivery partner applications and onboarding status." source="partners" partnerTypes={['ride', 'delivery']} singular="Partner application"/>
}
