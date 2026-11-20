import AdminUnavailablePage from './AdminUnavailablePage'

export default function SettingsPage() {
  return <AdminUnavailablePage title="Settings" description="Manage platform configuration and service preferences." icon="settings" capabilities={[{"title":"Service configuration","description":"Manage availability and operating settings for each Dorkar service."},{"title":"Notifications","description":"Maintain supported notification preferences and message templates."},{"title":"Platform preferences","description":"Review supported regional, safety, and operational settings."}]}/>
}
