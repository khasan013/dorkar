import { useState } from 'react'
import restaurantPartnerImage from '../assets/Dorkar-Restaurant-Partner-Banner.png'
import partnerNetworkImage from '../assets/partregistrationrequest.png'
import rideImage from '../assets/ride-shareing.png'

const partnerTypes = [
  { value: 'Restaurant Partner', title: 'Restaurant', description: 'Bring your menu to nearby customers.', image: restaurantPartnerImage, tone: 'orange' },
  { value: 'Delivery Partner', title: 'Delivery Partner', description: 'Join the delivery network and serve your city.', image: partnerNetworkImage, tone: 'red' },
  { value: 'Ride Partner', title: 'Ride Partner', description: 'Offer convenient rides on your schedule.', image: rideImage, tone: 'blue' },
]

export default function PartnerRegistrationPage() {
  const [partnerType, setPartnerType] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (submitting) return
    const form = event.currentTarget
    if (!form.reportValidity()) return
    const data = new FormData(form)
    const phone = String(data.get('phone') || '').replace(/\D/g, '')
    const localPhone = phone.startsWith('880') ? `0${phone.slice(3)}` : phone.length === 10 && phone.startsWith('1') ? `0${phone}` : phone
    if (!/^01[3-9]\d{8}$/.test(localPhone)) {
      setError('Enter a valid Bangladesh mobile number, such as 01XXXXXXXXX or +8801XXXXXXXXX.')
      return
    }
    if (!partnerType) {
      setError('Choose a partnership type to continue.')
      return
    }
    setError('')
    setSubmitting(true)
    window.setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
    }, 350)
  }

  return <main className="partner-page">
    <section className="partner-hero">
      <div className="partner-hero-copy">
        <span className="eyebrow">PARTNER WITH DORKAR</span>
        <h1>Grow Your Business<br/>with <span className="dorkar-word">Dorkar</span></h1>
        <p>Join our partner network and reach more customers across Bangladesh. Choose the partnership that fits your business or service.</p>
        <div className="partner-hero-benefits"><span><i aria-hidden="true">↗</i><b>More Customers</b></span><span><i aria-hidden="true">৳</i><b>Low Commission</b></span><span><i aria-hidden="true">✓</i><b>Trusted Platform</b></span></div>
      </div>
      <div className="partner-hero-image-wrap"><img src={partnerNetworkImage} alt="Dorkar delivery, restaurant, and ride partners in Bangladesh"/></div>
    </section>

    <section className="partner-section partner-choices" aria-labelledby="partner-choice-title">
      <div className="partner-section-heading"><h2 id="partner-choice-title">Choose Your Partner Type</h2><p>Select how you want to partner with Dorkar.</p></div>
      <div className="partner-category-grid" role="radiogroup" aria-label="Partnership type">
        {partnerTypes.map(type => <button className={`partner-category ${type.tone} ${partnerType===type.value?'selected':''}`} type="button" role="radio" aria-checked={partnerType===type.value} onClick={()=>{setPartnerType(type.value);setError('')}} key={type.value}>
          <span className="partner-category-copy"><span className="partner-category-mark" aria-hidden="true">{type.title==='Restaurant'?'R':type.title==='Ride Partner'?'R':'D'}</span><b>{type.title==='Restaurant'?'Restaurant Partner':type.title}</b><small>{type.title==='Restaurant'?'Bring your menu to thousands of customers.':type.title==='Ride Partner'?'Drive on your schedule and earn more.':'Earn by completing deliveries.'}</small></span><span className="partner-category-arrow" aria-hidden="true">→</span><span className="partner-category-image"><img src={type.title==='Restaurant'?restaurantPartnerImage:type.title==='Ride Partner'?rideImage:partnerNetworkImage} alt=""/></span><span className="partner-radio" aria-hidden="true"/>
        </button>)}
      </div>
    </section>

    <section className="partner-application" id="partner-application" aria-labelledby="partner-application-title">
      <div className="partner-form-visual"><div><span className="eyebrow">DORKAR PARTNERS</span><h2 id="partner-application-title">Partner Registration</h2><p>Tell us about your business and we’ll get in touch with you shortly.</p></div><img src={restaurantPartnerImage} alt="Dorkar restaurant partner"/></div>
      {submitted ? <div className="partner-success" role="status"><span className="partner-success-check">✓</span><div><span className="eyebrow">APPLICATION READY</span><h3>Thank you for your interest!</h3><p>Your details passed validation in this preview. Connect the partner registration API to deliver your application to Dorkar’s partnerships team.</p><button className="button outline" type="button" onClick={()=>setSubmitted(false)}>Submit another interest</button></div></div> : <form className="partner-form" onSubmit={handleSubmit} noValidate>
        <label className="partner-field"><span>Business or full name <i>*</i></span><input name="name" autoComplete="name" placeholder="Your name or business" required/></label>
        <label className="partner-field"><span>Partner type <i>*</i></span><select name="partnerType" value={partnerType} onChange={event=>{setPartnerType(event.target.value);setError('')}} required><option value="" disabled>Select partner type</option>{partnerTypes.map(type=><option value={type.value} key={type.value}>{type.value}</option>)}</select></label>
        <label className="partner-field"><span>Phone number <i>*</i></span><div className="partner-phone-input"><span aria-hidden="true">🇧🇩</span><b>+880</b><input name="phone" type="tel" autoComplete="tel-national" inputMode="tel" placeholder="1XXXXXXXXX" required/></div></label>
        <label className="partner-field"><span>Email address <i>*</i></span><input name="email" type="email" autoComplete="email" placeholder="you@example.com" required/></label>
        <label className="partner-field"><span>Business location <i>*</i></span><input name="location" autoComplete="street-address" placeholder="City and area (e.g. Gulshan, Dhaka)" required/></label>
        {error&&<p className="partner-form-error" role="alert">{error}</p>}
        <div className="partner-form-submit"><button className="button primary" type="submit" disabled={submitting}>{submitting?'Checking details…':'Submit Interest'} <span aria-hidden="true">→</span></button><p>By submitting, you agree to be contacted about partnership opportunities.</p></div>
      </form>}
    </section>
    <div className="partner-bottom-note"><span>Questions about joining?</span><a href="/support">Visit Help & Support →</a></div>
  </main>
}
