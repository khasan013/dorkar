import rideArtwork from '../assets/ride-shareing.png'
import foodArtwork from '../assets/food-delivery.png'
import parcelArtwork from '../assets/percel-delevary.png'
import bloodArtwork from '../assets/blood-donation.png'

const services = [
  { title: 'Ride Sharing', text: 'Get across town with convenient rides from trusted local drivers.', href: '/ride', image: rideArtwork, tone: 'pink', action: 'Explore rides' },
  { title: 'Food Delivery', text: 'Discover local restaurants and have your favorite meals delivered.', href: '/food', image: foodArtwork, tone: 'orange', action: 'Browse food' },
  { title: 'Parcel Delivery', text: 'Send documents, gifts, and everyday parcels across the city.', href: '/parcel', image: parcelArtwork, tone: 'blue', action: 'Send a parcel' },
  { title: 'Blood Donation', text: 'Connect with blood donors and help someone in your community.', href: '/blood', image: bloodArtwork, tone: 'pink', action: 'Find donors' },
]

export default function ServicesPage() {
  return <div className="services-page">
    <section className="services-page-hero">
      <span className="eyebrow">DORKAR SERVICES</span>
      <h1>Everyday help, all in one place.</h1>
      <p>Choose a service to get started. Dorkar brings rides, meals, parcels, and blood donation together for communities across Bangladesh.</p>
    </section>
    <section className="services-page-grid" aria-label="All Dorkar services">
      {services.map(service => <a className={`services-page-card ${service.tone}`} href={service.href} key={service.title}>
        <div className="services-page-card-copy"><span className="eyebrow">DORKAR</span><h2>{service.title}</h2><p>{service.text}</p><span className="services-page-action">{service.action}<span aria-hidden="true"> →</span></span></div>
        <img src={service.image} alt="" />
      </a>)}
    </section>
  </div>
}
