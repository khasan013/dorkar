import AdminUnavailablePage from './AdminUnavailablePage'

export default function PromotionsPage() {
  return <AdminUnavailablePage title="Promotions & Coupons" description="Plan campaign, coupon, and discount operations." icon="tag" capabilities={[{"title":"Campaign setup","description":"Define campaign details, eligible services, and active dates."},{"title":"Coupon rules","description":"Configure codes, limits, eligibility, and discount values."},{"title":"Campaign reporting","description":"Review redemptions and attributed order value after launch."}]}/>
}
