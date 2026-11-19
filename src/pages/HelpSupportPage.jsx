import { useState } from 'react'
import rideArtwork from '../assets/ride-shareing.png'
import foodArtwork from '../assets/food-delivery.png'
import parcelArtwork from '../assets/percel-delevary.png'
import bloodArtwork from '../assets/blood-donation.png'
import supportArtwork from '../assets/24_7-Support-D_HeadsetIllustration.png'
import bangladeshScenery from '../assets/Hero-bg-illlustration.png'

const topics = [
  [rideArtwork, 'Ride support', 'Bookings, pickup details, or a trip.', '/ride/history'],
  [foodArtwork, 'Food orders', 'Restaurants, menu details, or an order.', '/orders/history'],
  [parcelArtwork, 'Parcel delivery', 'Sending, receiving, or tracking a parcel.', '/parcel/tracking'],
  [bloodArtwork, 'Blood donation', 'Donor search and donation requests.', '/blood/donors'],
]

const questions = [
  ['How do I get help with a booking?', 'Open the relevant service page or your history page to find the booking details. You can also send our team a message using the form on this page.'],
  ['How do I cancel a ride or order?', 'Cancellation availability and any applicable fees depend on the service and booking status. Open your booking details to review the available options.'],
  ['How do refunds work?', 'Refund eligibility, timing, and payment method depend on the relevant service policy and payment provider. Review the policy shown for your booking or send our team a support request.'],
  ['Where can I check a ride, food order, or parcel?', 'Use Ride History or Order History for completed activity. Active ride, order, and parcel tracking pages are available from the related service flow.'],
  ['How can I update my account information?', 'Visit your Profile from the account menu to review your personal details. Sign in first if you are not already logged in.'],
  ['How do I find a blood donor?', 'Open Blood Donation and search by blood group and area. If you need donors for a patient, use the donation request form to share the details.'],
]

export default function HelpSupportPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const searchTerm = searchQuery.trim().toLowerCase()
  const filteredTopics = topics.filter(([, title, text]) => `${title} ${text}`.toLowerCase().includes(searchTerm))
  const filteredQuestions = questions.filter(([question, answer]) => `${question} ${answer}`.toLowerCase().includes(searchTerm))
  return <div className="company-page support-page">
    <section className="company-hero support-hero">
      <div className="company-hero-copy">
        <span className="eyebrow">DORKAR CUSTOMER CARE</span>
        <h1>How can we help?</h1>
        <p>Find answers to common questions or tell us what you need help with. Choose a service below to get to the right place.</p>
        <a className="button primary" href="/contact">Contact support <span aria-hidden="true">→</span></a>
      </div>
      <div className="support-hero-art"><img className="support-hero-image" src={supportArtwork} alt="Dorkar customer support headset illustration"/></div>
    </section>

    <section className="company-section support-shortcuts">
      <div className="support-shortcuts-heading"><div className="company-section-heading"><span className="eyebrow">GET HELP WITH</span><h2>Choose a service</h2><p>Jump to the information and tools related to your question.</p></div><div className="support-search" aria-label="Search help topics"><label htmlFor="support-search-input"><span className="support-search-icon" aria-hidden="true"/><input id="support-search-input" type="search" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Search help, e.g. cancel ride, refund, blood donation"/><span className="support-search-count" aria-live="polite">{searchTerm ? `${filteredTopics.length + filteredQuestions.length} results` : 'Search help'}</span></label></div></div>
      <div className="support-topic-grid">{filteredTopics.map(([image, title, text, href], index) => <a className="support-topic-card" href={href} key={title}><span className={`support-topic-icon topic-image-${topics.findIndex(topic => topic[1] === title)+1}`}><img src={image} alt=""/></span><div><h3>{title}</h3><p>{text}</p></div><b aria-hidden="true">→</b></a>)}</div>
      {searchTerm && filteredTopics.length === 0 && <p className="support-empty-search">No service matches that search. Try another phrase or contact Dorkar Support below.</p>}
    </section>

    <section className="company-section support-faq" id="support-faq">
        <div className="company-section-heading"><span className="eyebrow">QUICK ANSWERS</span><h2>Frequently asked questions</h2></div>
        <div className="support-faq-list">{filteredQuestions.map(([question, answer]) => <details className="support-faq-item" key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}{searchTerm && filteredQuestions.length === 0 && <p className="support-empty-search">No answers found. Send us a support request and include your question.</p>}</div>
    </section>

    <section className="support-contact-strip"><img className="support-contact-art" src={bangladeshScenery} alt=""/><div className="support-contact-copy"><b>Still need a hand?</b><p>For general questions or partnership enquiries, contact the Dorkar team.</p></div><a className="button primary" href="/contact">Contact support <span aria-hidden="true">→</span></a></section>
  </div>
}
