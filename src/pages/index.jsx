import HomePage from './HomePage'
import RideSharingPage from './RideSharingPage'
import FoodDeliveryPage from './FoodDeliveryPage'
import ParcelDeliveryPage from './ParcelDeliveryPage'
import BloodDonationPage from './BloodDonationPage'
import SignInPage from './SignInPage'
import SignUpPage from './SignUpPage'
import UserDashboardPage from './UserDashboardPage'
import ProfilePage from './ProfilePage'
import SettingsPage from './SettingsPage'
import RideBookingPage from './RideBookingPage'
import RideTrackingPage from './RideTrackingPage'
import FoodRestaurantsPage from './FoodRestaurantsPage'
import FoodDetailsPage from './FoodDetailsPage'
import CartPage from './CartPage'
import CheckoutPage from './CheckoutPage'
import OrderTrackingPage from './OrderTrackingPage'
import ParcelBookingPage from './ParcelBookingPage'
import ParcelTrackingPage from './ParcelTrackingPage'
import BloodDonorSearchPage from './BloodDonorSearchPage'
import BloodDonationRequestPage from './BloodDonationRequestPage'
import DonorProfilePage from './DonorProfilePage'
import PaymentPage from './PaymentPage'
import NotificationsPage from './NotificationsPage'
import RideHistoryPage from './RideHistoryPage'
import OrderHistoryPage from './OrderHistoryPage'
import ActivityPage from './ActivityPage'
import HelpSupportPage from './HelpSupportPage'
import AboutUsPage from './AboutUsPage'
import ContactUsPage from './ContactUsPage'
import PartnerRegistrationPage from './PartnerRegistrationPage'
import TermsConditionsPage from './TermsConditionsPage'
import PrivacyPolicyPage from './PrivacyPolicyPage'
import HowItWorksPage from './HowItWorksPage'
import ServicesPage from './ServicesPage'
import AdminDashboardPage from './AdminDashboardPage'
import { DetailedPage } from './PageRenderer'
import SiteFooter from './SiteFooter'
import { useEffect } from 'react'
import { readAuthSession, redirectToLogin } from '../auth/session'

const protectedPaths = new Set([
  '/dashboard',
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
  '/dashboard': UserDashboardPage,
  '/admin': AdminDashboardPage,
  '/admin/dashboard': AdminDashboardPage,
  '/admin/users': AdminDashboardPage,
  '/admin/drivers': AdminDashboardPage,
  '/admin/rides': AdminDashboardPage,
  '/admin/food': AdminDashboardPage,
  '/admin/parcels': AdminDashboardPage,
  '/admin/blood': AdminDashboardPage,
  '/admin/orders': AdminDashboardPage,
  '/admin/payments': AdminDashboardPage,
  '/admin/promotions': AdminDashboardPage,
  '/admin/support': AdminDashboardPage,
  '/admin/reports': AdminDashboardPage,
  '/admin/settings': AdminDashboardPage,
  '/admin/access': AdminDashboardPage,
  '/admin/logs': AdminDashboardPage,
  '/profile': ProfilePage,
  '/settings': SettingsPage,
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
  const isProtected = protectedPaths.has(path) && !session
  const isAdminPath = path === '/admin' || path.startsWith('/admin/')
  const hasAdminRole = ['ADMIN', 'SUPER_ADMIN'].includes(String(session?.user?.role || '').toUpperCase())
  useEffect(() => {
    if (isProtected) redirectToLogin()
  }, [isProtected])

  if (isProtected) return <main className="auth-redirect" role="status">Redirecting you to sign in…</main>
  if (isAdminPath && !hasAdminRole) return <main className="admin-denied"><div><span>403</span><h1>Admin access required</h1><p>Sign in with an administrator account to open the Dorkar admin dashboard.</p><a href="/dashboard">Go to your dashboard</a></div></main>
  if (path === '/') return <HomePage />
  const Page = routes[path]
  if (!Page) return <HomePage />
  if (isAdminPath) return <Page />
  if (path === '/login' || path === '/register' || path === '/dashboard') return <><Page /><SiteFooter /></>
  return <DetailedPage><Page /></DetailedPage>
}
