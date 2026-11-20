const pillars = [
  ['01', 'Designed for daily life', 'Bring essential services into one clear, dependable experience for people across Bangladesh.'],
  ['02', 'Built around trust', 'Make service details, expectations, and next steps easy to understand at every stage.'],
  ['03', 'Connected communities', 'Help customers and local service partners find one another through useful, accessible tools.'],
]

const services = [
  ['Ride Sharing', 'Convenient trips around your city.', rideArtwork, '/ride', 'ride'],
  ['Food Delivery', 'Meals from restaurants nearby.', foodArtwork, '/food', 'food'],
  ['Parcel Delivery', 'Send everyday items across town.', parcelArtwork, '/parcel', 'parcel'],
  ['Blood Donation', 'Find donors and support urgent needs.', bloodArtwork, '/blood', 'blood'],
]

export default function AboutUsPage() {
  return <div className="company-page about-page">
    <section className="company-hero about-hero">
      <div className="company-hero-copy">
        <span className="eyebrow">ABOUT DORKAR · BANGLADESH</span>
        <h1>One platform for the things that keep life moving.</h1>
        <p>Dorkar brings everyday services into one place: getting across town, enjoying a meal, sending a parcel, and connecting with blood donors.</p>
        <div className="company-hero-actions"><a className="button primary" href="/services">Explore our services</a><a className="company-text-link" href="/partner">Partner with Dorkar</a></div>
      </div>
      <div className="about-hero-art" aria-label="Dorkar ride, food, parcel, and blood donation services"><div className="about-art-grid"><div className="about-art-card"><img src={rideArtwork} alt="Ride sharing"/></div><div className="about-art-card"><img src={foodArtwork} alt="Food delivery"/></div><div className="about-art-card"><img src={parcelArtwork} alt="Parcel delivery"/></div><div className="about-art-card"><img src={bloodArtwork} alt="Blood donation"/></div></div><div className="about-art-logo"><img src={dorkarLogo} alt="Dorkar"/></div></div>
    </section>

    <section className="company-section about-mission">
      <div className="company-section-heading"><span className="eyebrow">OUR PURPOSE</span><h2>Make everyday services easier to reach.</h2><p>We are building a practical, connected experience for customers and the local partners who serve them.</p></div>
      <div className="company-pillar-grid">{pillars.map(([number, title, text]) => <article className="company-pillar" key={number}><span className="company-pillar-number">{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
    </section>

    <section className="company-section about-services">
      <div className="company-section-heading row-heading"><div><span className="eyebrow">ONE APP · FOUR SERVICES</span><h2>What Dorkar brings together</h2></div><a className="company-text-link" href="/services">View all services</a></div>
      <div className="about-service-grid">{services.map(([title, text, image, href, tone]) => <a className={`about-service-card ${tone}`} href={href} key={title}><span className="about-service-image"><img src={image} alt=""/></span><div><h3>{title}</h3><p>{text}</p></div></a>)}</div>
    </section>

    <section className="company-cta"><div><span className="eyebrow">BUILD WITH US</span><h2>Help shape a better everyday experience.</h2><p>We welcome customers, community members, and service partners to be part of Dorkar’s journey.</p></div><div className="company-cta-actions"><a className="button primary" href="/partner">Become a partner</a><a className="button outline" href="/contact">Contact our team</a></div></section>
  </div>
}
import rideArtwork from '../assets/ride-shareing.png'
import foodArtwork from '../assets/food-delivery.png'
import parcelArtwork from '../assets/percel-delevary.png'
import bloodArtwork from '../assets/blood-donation.png'
import dorkarLogo from '../assets/D-Logo.png'

