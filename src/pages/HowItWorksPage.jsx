import { DetailedPage } from './PageRenderer'

const steps = [
  ['01', 'Choose a service', 'Pick a ride, a meal, a parcel delivery, or blood donation support.'],
  ['02', 'Add your details', 'Enter the locations and information needed for your request.'],
  ['03', 'Review and confirm', 'Check the details and choose an available payment option.'],
  ['04', 'Follow every update', 'Track your ride or delivery and get updates along the way.'],
]

const serviceLinks = [
  ['🚘', 'Ride sharing', 'Choose pickup and destination, then book a nearby ride.', '/ride'],
  ['🍲', 'Food delivery', 'Browse restaurants and follow your order to the door.', '/food'],
  ['📦', 'Parcel delivery', 'Set pickup and drop-off details to send a parcel.', '/parcel'],
  ['♥', 'Blood donation', 'Search for donors or create a donation request.', '/blood'],
]

export default function HowItWorksPage() {
  return <DetailedPage>
    <div className="how-page">
      <section className="how-hero">
        <span className="eyebrow">A SIMPLE WAY TO GET THINGS DONE</span>
        <h1>How Dorkar works</h1>
        <p>One place for everyday rides, meals, parcels, and community care in Bangladesh.</p>
      </section>

      <section aria-labelledby="how-steps-heading">
        <div className="how-section-heading">
          <span className="eyebrow">GET STARTED</span>
          <h2 id="how-steps-heading">Four simple steps</h2>
          <p>From your first tap to the final update, your request stays clear and easy to follow.</p>
        </div>
        <div className="how-step-grid">
          {steps.map(([number, title, description]) => <article className="how-step-card" key={number}>
            <span className="how-step-number">{number}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>)}
        </div>
      </section>

      <section aria-labelledby="how-services-heading">
        <div className="how-section-heading how-services-heading">
          <span className="eyebrow">ONE APP, FOUR SERVICES</span>
          <h2 id="how-services-heading">Choose what you need today</h2>
        </div>
        <div className="how-service-grid">
          {serviceLinks.map(([icon, title, description, href]) => <a className="how-service-card" href={href} key={href}>
            <span aria-hidden="true">{icon}</span>
            <div><h3>{title}</h3><p>{description}</p></div>
            <b aria-hidden="true">→</b>
          </a>)}
        </div>
      </section>
    </div>
  </DetailedPage>
}
