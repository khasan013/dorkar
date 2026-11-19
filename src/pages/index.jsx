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
import { DetailedPage } from './PageRenderer'
import SiteFooter from './SiteFooter'

const routes = {
  '/services': ServicesPage,
  '/ride': RideSharingPage,
  '/food': FoodDeliveryPage,
  '/parcel': ParcelDeliveryPage,
  '/blood': BloodDonationPage,
  '/login': SignInPage,
  '/register': SignUpPage,
  '/dashboard': UserDashboardPage,
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
  const path = window.location.pathname.replace(/\/$/, '') || '/'
  if (path === '/') return <HomePage />
  const Page = routes[path] || UserDashboardPage
  if (path === '/login' || path === '/register' || path === '/dashboard') return <><Page /><SiteFooter /></>
  return <DetailedPage><Page /></DetailedPage>
}
