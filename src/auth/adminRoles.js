export const adminRoleDefinitions = [
  { value: 'SUPER_ADMIN', label: 'Super Admin', scope: 'Full control of every admin module, administrator roles, and platform settings.', permissions: 'All modules · role assignment · settings · system logs' },
  { value: 'OPERATIONS_ADMIN', label: 'Operations Admin', scope: 'Manage service operations, partner onboarding, bookings, and promotions.', permissions: 'Drivers · rides · food · parcels · blood · orders · partners · promotions' },
  { value: 'FINANCE_ADMIN', label: 'Finance Admin', scope: 'Manage payment operations and financial reporting.', permissions: 'Payments · transactions · finance reports' },
  { value: 'SUPPORT_ADMIN', label: 'Support Admin', scope: 'Manage customer accounts and support cases.', permissions: 'Users · account status · support tickets' },
  { value: 'RIDE_ADMIN', label: 'Ride Admin', scope: 'Manage ride bookings and ride-share driver operations.', permissions: 'Ride management · drivers · ride orders' },
  { value: 'FOOD_ADMIN', label: 'Food Admin', scope: 'Manage restaurant onboarding, menus, and food orders.', permissions: 'Restaurants · menus · food orders' },
  { value: 'PARCEL_ADMIN', label: 'Parcel Admin', scope: 'Manage parcel bookings, dispatch, and delivery.', permissions: 'Parcel management · parcel orders' },
  { value: 'BLOOD_ADMIN', label: 'Blood Donation Admin', scope: 'Manage donor and blood-request operations.', permissions: 'Donors · blood requests · matching' },
]

const adminRoles = new Set(adminRoleDefinitions.map(role => role.value).concat('ADMIN'))

export function isAdminRole(role) {
  return adminRoles.has(String(role || '').toUpperCase())
}

export function adminRoleLabel(role) {
  const normalized = String(role || '').toUpperCase()
  if (normalized === 'ADMIN') return 'Super Admin'
  return adminRoleDefinitions.find(item => item.value === normalized)?.label || String(role || 'Admin')
}

const allowedPaths = {
  OPERATIONS_ADMIN: ['/admin/dashboard', '/admin/drivers', '/admin/rides', '/admin/food', '/admin/parcels', '/admin/blood', '/admin/orders', '/admin/promotions', '/admin/access'],
  FINANCE_ADMIN: ['/admin/dashboard', '/admin/payments', '/admin/reports'],
  SUPPORT_ADMIN: ['/admin/dashboard', '/admin/users', '/admin/support'],
  RIDE_ADMIN: ['/admin/dashboard', '/admin/drivers', '/admin/rides', '/admin/orders'],
  FOOD_ADMIN: ['/admin/dashboard', '/admin/food', '/admin/orders'],
  PARCEL_ADMIN: ['/admin/dashboard', '/admin/parcels', '/admin/orders'],
  BLOOD_ADMIN: ['/admin/dashboard', '/admin/blood'],
}

export function canAccessAdminPath(role, path) {
  const normalized = String(role || '').toUpperCase()
  if (normalized === 'ADMIN' || normalized === 'SUPER_ADMIN') return true
  if (path === '/admin') path = '/admin/dashboard'
  const allowed = allowedPaths[normalized] || []
  return allowed.some(item => path === item || path.startsWith(`${item}/`))
}
