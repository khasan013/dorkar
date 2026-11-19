import appScreens from '../assets/BangladeshNavigationandFoodApps-transparent.png'
import rideArtwork from '../assets/ride-shareing.png'
import foodArtwork from '../assets/food-delivery.png'
import parcelArtwork from '../assets/percel-delevary.png'
import bloodArtwork from '../assets/blood-donation.png'
import googlePlayIcon from '../assets/Google-Play-Icon.png'
import chooseServiceArt from '../assets/choose-service.png'
import addDetailsArt from '../assets/Dorkar-Add-Your-Details_Mockup.png'
import confirmBookingArt from '../assets/Dorkar-Ride-Booking-Confirmation.png'
import trackingArt from '../assets/Dorkar-Delivery-Tracking-UI.png'
import heroScenery from '../assets/Hero-bg-illlustration.png'

const steps = [
  ['01', 'Choose a service', 'Pick a ride, a meal, a parcel delivery, or blood donation support.', 'rose', chooseServiceArt],
  ['02', 'Add your details', 'Enter the locations and information needed for your request.', 'blue', addDetailsArt],
  ['03', 'Review and confirm', 'Check the details and choose an available payment option.', 'orange', confirmBookingArt],
  ['04', 'Follow every update', 'Track your ride or delivery and get updates along the way.', 'green', trackingArt],
]

const serviceLinks = [
  [rideArtwork, 'Ride sharing', 'Choose pickup and destination, then book a nearby ride.', '/ride', 'ride'],
  [foodArtwork, 'Food delivery', 'Browse restaurants and follow your order to the door.', '/food', 'food'],
  [parcelArtwork, 'Parcel delivery', 'Set pickup and drop-off details to send a parcel anywhere in Bangladesh.', '/parcel', 'parcel'],
  [bloodArtwork, 'Blood donation', 'Search for donors or create a donation request near you.', '/blood', 'blood'],
]

export default function HowItWorksPage() {
  return <div className="how-page">
    <section className="how-hero">
      <img className="how-hero-background" src={heroScenery} alt="" aria-hidden="true"/>
      <div className="how-hero-copy">
        <span className="eyebrow"><b>A SIMPLE WAY</b> TO GET THINGS DONE</span>
        <h1>How <span className="dorkar-word">Dorkar</span> Works</h1>
        <p>One place for everyday rides, meals, parcels, and community care in Bangladesh.</p>
        <a className="how-play-badge" href="/#download" aria-label="Get Dorkar on Google Play"><img src={googlePlayIcon} alt=""/><span><small>GET IT ON</small><b>Google Play</b></span></a>
      </div>
      <div className="how-hero-art"><img src={appScreens} alt="Dorkar ride navigation and food delivery app screens"/></div>
    </section>

    <section className="how-steps-section" aria-labelledby="how-steps-heading">
      <div className="how-section-heading">
        <span className="eyebrow">GET STARTED</span>
        <h2 id="how-steps-heading">Four simple steps</h2>
        <p>From your first tap to the final update, your request stays clear and easy to follow.</p>
      </div>
      <div className="how-step-grid">
        {steps.map(([number, title, description, tone, image]) => <article className={`how-step-card ${tone}`} key={number}>
          <span className="how-step-number">{number}</span>
          <span className="how-step-art-frame"><img className="how-step-art" src={image} alt={`${title} app screen`}/></span>
          <h3>{title}</h3>
          <p>{description}</p>
        </article>)}
      </div>
    </section>

    <section className="how-services-section" aria-labelledby="how-services-heading">
      <div className="how-section-heading how-services-heading">
        <span className="eyebrow">ONE APP, FOUR SERVICES</span>
        <h2 id="how-services-heading">Choose what you need today</h2>
      </div>
      <div className="how-service-grid">
        {serviceLinks.map(([image, title, description, href, tone]) => <a className={`how-service-card ${tone}`} href={href} key={href}>
          <span className="how-service-image"><img src={image} alt=""/></span>
          <div><h3>{title}</h3><p>{description}</p></div>
          <b aria-hidden="true">→</b>
        </a>)}
      </div>
    </section>
  </div>
}
