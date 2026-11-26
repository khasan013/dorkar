import HomePage from './HomePage'
import RideSharingPage from './ride-shareing/RideSharingPage'
import FoodDeliveryPage from './Food/FoodDeliveryPage'
import ParcelDeliveryPage from './parcel/ParcelDeliveryPage'
import BloodDonationPage from './Blood/BloodDonationPage'
import SignInPage from './SignInPage'
import SignUpPage from './SignUpPage'
import UserDashboardPage from './User/UserDashboardPage'
import ProfilePage from './User/ProfilePage'
import SettingsPage from './User/SettingsPage'
import RideBookingPage from './ride-shareing/RideBookingPage'
import RideTrackingPage from './ride-shareing/RideTrackingPage'
import FoodRestaurantsPage from './Restaurant/FoodRestaurantsPage'
import FoodDetailsPage from './Food/FoodDetailsPage'
import CartPage from './Food/CartPage'
import CheckoutPage from './Food/CheckoutPage'
import OrderTrackingPage from './Food/OrderTrackingPage'
import ParcelBookingPage from './parcel/ParcelBookingPage'
import ParcelTrackingPage from './parcel/ParcelTrackingPage'
import BloodDonorSearchPage from './Blood/BloodDonorSearchPage'
import BloodDonationRequestPage from './Blood/BloodDonationRequestPage'
import DonorProfilePage from './Blood/DonorProfilePage'
import PaymentPage from './User/PaymentPage'
import NotificationsPage from './User/NotificationsPage'
import RideHistoryPage from './User/RideHistoryPage'
import OrderHistoryPage from './User/OrderHistoryPage'
import ActivityPage from './User/ActivityPage'
import HelpSupportPage from './HelpSupportPage'
import AboutUsPage from './AboutUsPage'
import ContactUsPage from './ContactUsPage'
import PartnerRegistrationPage from './PartnerRegistrationPage'
import TermsConditionsPage from './TermsConditionsPage'
import PrivacyPolicyPage from './PrivacyPolicyPage'
import HowItWorksPage from './HowItWorksPage'
import ServicesPage from './ServicesPage'
import AdminDashboardPage from './admin/DashboardPage'
import AdminUsersPage from './admin/UsersPage'
import AdminDriversPage from './admin/DriversPage'
import AdminRideManagementPage from './admin/RideManagementPage'
import AdminFoodManagementPage from './admin/FoodManagementPage'
import AdminParcelManagementPage from './admin/ParcelManagementPage'
import AdminBloodDonationPage from './admin/BloodDonationPage'
import AdminOrdersPage from './admin/OrdersPage'
import AdminPaymentsPage from './admin/PaymentsPage'
import AdminPromotionsPage from './admin/PromotionsPage'
import AdminSupportPage from './admin/SupportPage'
import AdminReportsPage from './admin/ReportsPage'
import AdminSettingsPage from './admin/SettingsPage'
import AdminRolesPage from './admin/AdminRolesPage'
import AdminSystemLogsPage from './admin/SystemLogsPage'
import { DetailedPage } from './PageRenderer'
import SiteFooter from './SiteFooter'
import { useEffect, useState } from 'react'
import { readAuthSession, redirectToLogin, saveAuthSession } from '../auth/session'
import { canAccessAdminPath, isAdminRole } from '../auth/adminRoles'
import ChangePasswordPage from './ChangePasswordPage'
import RestaurantPartnerDashboardPage from './Restaurant/PartnerDashboardPage'
import RestaurantPartnerWorkspacePage from './Restaurant/RestaurantPartnerWorkspacePage'
import RiderDashboardPage from './Rider/RiderDashboardPage'

const protectedPaths = new Set([
  '/dashboard',
  '/restaurant/dashboard',
  '/restaurant/orders',
  '/restaurant/menu',
  '/restaurant/categories',
  '/restaurant/promotions',
  '/restaurant/reviews',
  '/restaurant/analytics',
  '/restaurant/payouts',
  '/restaurant/profile',
  '/restaurant/staff',
  '/restaurant/settings',
  '/rider/dashboard',
  '/rider/deliveries',
  '/rider/earnings',
  '/rider/performance',
  '/change-password',
  '/profile',
  '/settings',
  '/payment',
  '/notifications',
  '/ride/history',
  '/orders/history',
  '/activity',
  '/admin',
  '/admin/dashboard',
  '/admin/users',
  '/admin/drivers',
  '/admin/rides',
  '/admin/food',
  '/admin/parcels',
  '/admin/blood',
  '/admin/orders',
  '/admin/payments',
  '/admin/promotions',
  '/admin/support',
  '/admin/reports',
  '/admin/settings',
  '/admin/access',
  '/admin/logs',
])

const routes = {
  '/services': ServicesPage,
  '/ride': RideSharingPage,
  '/food': FoodDeliveryPage,
  '/parcel': ParcelDeliveryPage,
  '/blood': BloodDonationPage,
  '/login': SignInPage,
  '/register': SignUpPage,
  '/admin': AdminDashboardPage,
  '/admin/dashboard': AdminDashboardPage,
  '/admin/users': AdminUsersPage,
  '/admin/drivers': AdminDriversPage,
  '/admin/rides': AdminRideManagementPage,
  '/admin/food': AdminFoodManagementPage,
  '/admin/parcels': AdminParcelManagementPage,
  '/admin/blood': AdminBloodDonationPage,
  '/admin/orders': AdminOrdersPage,
  '/admin/payments': AdminPaymentsPage,
  '/admin/promotions': AdminPromotionsPage,
  '/admin/support': AdminSupportPage,
  '/admin/reports': AdminReportsPage,
  '/admin/settings': AdminSettingsPage,
  '/admin/access': AdminRolesPage,
  '/admin/logs': AdminSystemLogsPage,
  '/settings': SettingsPage,
  '/restaurant/dashboard': RestaurantPartnerDashboardPage,
  '/restaurant/orders': RestaurantPartnerWorkspacePage,
  '/restaurant/menu': RestaurantPartnerWorkspacePage,
  '/restaurant/categories': RestaurantPartnerWorkspacePage,
  '/restaurant/promotions': RestaurantPartnerWorkspacePage,
  '/restaurant/reviews': RestaurantPartnerWorkspacePage,
  '/restaurant/analytics': RestaurantPartnerWorkspacePage,
  '/restaurant/payouts': RestaurantPartnerWorkspacePage,
  '/restaurant/profile': RestaurantPartnerWorkspacePage,
  '/restaurant/staff': RestaurantPartnerWorkspacePage,
  '/restaurant/settings': RestaurantPartnerWorkspacePage,
  '/rider/dashboard': RiderDashboardPage,
  '/rider/deliveries': RiderDashboardPage,
  '/rider/earnings': RiderDashboardPage,
  '/rider/performance': RiderDashboardPage,
  '/ride/booking': RideBookingPage,
  '/ride/tracking': RideTrackingPage,
  '/food/restaurants': FoodRestaurantsPage,
  '/food/details': FoodDetailsPage,
  '/cart': CartPage,
  '/checkout': CheckoutPage,
  '/orders/tracking': OrderTrackingPage,
  '/parcel/booking': ParcelBookingPage,
  '/parcel/tracking': ParcelTrackingPage,
  '/blood/donors': BloodDonorSearchPage,
  '/blood/request': BloodDonationRequestPage,
  '/blood/donor-profile': DonorProfilePage,
  '/payment': PaymentPage,
  '/notifications': NotificationsPage,
  '/ride/history': RideHistoryPage,
  '/orders/history': OrderHistoryPage,
  '/activity': ActivityPage,
  '/support': HelpSupportPage,
  '/about': AboutUsPage,
  '/contact': ContactUsPage,
  '/partner': PartnerRegistrationPage,
  '/terms': TermsConditionsPage,
  '/privacy': PrivacyPolicyPage,
  '/how-it-works': HowItWorksPage,
}

export default function Pages() {
  const requestedPath = window.location.pathname.replace(/\/$/, '') || '/'
  const path = requestedPath === '/signin' ? '/login' : requestedPath === '/signup' ? '/register' : requestedPath
  const session = readAuthSession()
  const [resolvedUser, setResolvedUser] = useState(session?.user || null)
  const partnerRouteNeedsRefresh = path === '/dashboard' || path.startsWith('/restaurant/') || path.startsWith('/rider/')
  const [partnerTypeResolved, setPartnerTypeResolved] = useState(!partnerRouteNeedsRefresh || !session)
  const isProtected = protectedPaths.has(path) && !session
  const isAdminPath = path === '/admin' || path.startsWith('/admin/')
  const hasAdminRole = isAdminRole(session?.user?.role)
  const hasAdminPageAccess = hasAdminRole && canAccessAdminPath(session?.user?.role, path)
  const adminOnUserDashboard = path === '/dashboard' && hasAdminRole
  const mustChangePassword = Boolean(session?.user?.mustChangePassword)
  const restaurantOnUserDashboard = path === '/dashboard' && String(resolvedUser?.partnerType || '').toUpperCase() === 'RESTAURANT'
  const riderPartnerType = String(resolvedUser?.partnerType || '').toUpperCase()
  const isRiderPartner = ['DELIVERY', 'RIDE', 'RIDE_SHARE', 'RIDE-SHARE'].includes(riderPartnerType)
  const riderOnUserDashboard = path === '/dashboard' && isRiderPartner
  const riderRouteDenied = path.startsWith('/rider/') && partnerTypeResolved && !isRiderPartner
  const restaurantRouteDenied = path.startsWith('/restaurant/') && partnerTypeResolved && String(resolvedUser?.partnerType || '').toUpperCase() !== 'RESTAURANT'
  useEffect(() => {
    if (isProtected) redirectToLogin()
  }, [isProtected])
  useEffect(() => {
    if (adminOnUserDashboard) window.location.replace('/admin')
  }, [adminOnUserDashboard])
  useEffect(() => {
    if (restaurantOnUserDashboard) window.location.replace('/restaurant/dashboard')
  }, [restaurantOnUserDashboard])
  useEffect(() => {
    if (riderOnUserDashboard) window.location.replace('/rider/dashboard')
  }, [riderOnUserDashboard])
  useEffect(() => {
    if (!session?.accessToken || partnerTypeResolved || !partnerRouteNeedsRefresh) return
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 10000)
    fetch(`${(import.meta.env.VITE_API_BASE_URL || 'https://dorker-backend.onrender.com').trim().replace(/\/$/, '')}/api/v1/users/me`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${session.accessToken}` },
      signal: controller.signal,
    }).then(async response => {
      const result = await response.json().catch(() => null)
      if (!response.ok || result?.success === false || !result?.data) return
      const refreshed = result.data
      setResolvedUser(refreshed)
      saveAuthSession({ ...session, user: refreshed })
      if (path === '/dashboard' && String(refreshed.partnerType || '').toUpperCase() === 'RESTAURANT') {
        window.location.replace('/restaurant/dashboard')
      }
      if (path === '/dashboard' && ['DELIVERY', 'RIDE', 'RIDE_SHARE', 'RIDE-SHARE'].includes(String(refreshed.partnerType || '').toUpperCase())) {
        window.location.replace('/rider/dashboard')
      }
    }).catch(() => {}).finally(() => {
      window.clearTimeout(timeout)
      setPartnerTypeResolved(true)
    })
    return () => { window.clearTimeout(timeout); controller.abort() }
  }, [path, partnerTypeResolved, partnerRouteNeedsRefresh, session?.accessToken])
  useEffect(() => {
    if (mustChangePassword && path !== '/change-password') window.location.replace('/change-password')
  }, [mustChangePassword, path])

  if (isProtected) return <main className="auth-redirect" role="status">Redirecting you to sign in…</main>
  if (adminOnUserDashboard) return <main className="auth-redirect" role="status">Opening your admin dashboard…</main>
  if (restaurantOnUserDashboard) return <main className="auth-redirect" role="status">Opening your restaurant dashboard…</main>
  if (riderOnUserDashboard) return <main className="auth-redirect" role="status">Opening your rider dashboard…</main>
  if (!partnerTypeResolved && (path === '/dashboard' || path.startsWith('/restaurant/') || path.startsWith('/rider/'))) return <main className="auth-redirect" role="status">Checking your partner dashboard…</main>
  if (mustChangePassword && path !== '/change-password') return <main className="auth-redirect" role="status">Opening required password update…</main>
  if (path === '/change-password') return <><ChangePasswordPage/><SiteFooter/></>
  if (isAdminPath && !hasAdminRole) return <main className="admin-denied"><div><span>403</span><h1>Admin access required</h1><p>Sign in with an administrator account to open the Dorkar admin dashboard.</p><a href="/dashboard">Go to your dashboard</a></div></main>
  if (isAdminPath && !hasAdminPageAccess) return <main className="admin-denied"><div><span>403</span><h1>Admin role does not allow this area</h1><p>Your account can only manage the modules assigned to its role. Contact a Super Admin if you need access.</p><a href="/admin">Return to your admin dashboard</a></div></main>
  if (restaurantRouteDenied) return <main className="admin-denied"><div><span>403</span><h1>Restaurant partner access required</h1><p>Sign in with the restaurant account created by your Dorkar administrator.</p><a href="/dashboard">Go to your dashboard</a></div></main>
  if (riderRouteDenied) return <main className="admin-denied"><div><span>403</span><h1>Rider access required</h1><p>Sign in with a delivery rider or ride-share driver account created by your Dorkar administrator.</p><a href="/dashboard">Go to your dashboard</a></div></main>
  if (path === '/') return <HomePage />
  if (path === '/dashboard') return <><UserDashboardPage /><SiteFooter /></>
  if (path === '/profile') return <DetailedPage><ProfilePage /></DetailedPage>
  const Page = routes[path]
  if (!Page) return <HomePage />
  if (isAdminPath) return <Page />
  if (path.startsWith('/restaurant/')) return <Page />
  if (path.startsWith('/rider/')) return <Page />
  if (path === '/login' || path === '/register') return <><Page /><SiteFooter /></>
  return <DetailedPage><Page /></DetailedPage>
}
