import PolicyPage from './PolicyPage'

const sections = [
  { title: 'Eligibility and accounts', paragraphs: [
    'You must be at least 18 years old and legally capable of entering into a binding agreement to create an account, unless a specific feature is lawfully made available to a minor with required guardian involvement. You must provide accurate, current information and update it when it changes.',
    'You are responsible for your account, password, OTPs and device security, and for activity carried out through your account. Do not share, sell, rent or transfer your account. Notify Dorkar promptly if you suspect unauthorised access. We may request identity, age, driving, vehicle or business verification for safety, fraud prevention or legal compliance.',
  ]},
  { title: 'Dorkar’s role and independent providers', paragraphs: [
    'The Platform provides technology and coordination tools that may allow users to discover, request, arrange, pay for or communicate with independent drivers, riders, couriers, restaurants, merchants and other providers (“Service Providers”). Unless a separate written agreement says otherwise, Dorkar is not itself the provider of the underlying ride, meal preparation, parcel carriage, medical service or blood donation.',
    'Service Providers may operate independently and are not automatically employees or agents of Dorkar merely because they use the Platform. The actual relationship depends on the facts and applicable law. Nothing in these Terms excludes any legal responsibility that cannot lawfully be excluded. Dorkar does not guarantee that a provider will be available, accept a request or complete a service.',
  ]},
  { title: 'General user conduct', paragraphs: [
    'Use the Platform only for lawful purposes. Treat other users and providers respectfully, give accurate booking and delivery information, follow safety instructions and do not interfere with the Platform.',
    'You must not impersonate another person, submit false documents, use another person’s account, harass or threaten anyone, commit fraud, manipulate fares or promotions, misuse personal data, carry prohibited goods, reverse engineer or attack the Platform, or use the Platform for unlawful activities. You are responsible for the accuracy of addresses, contact details, pickup points, destinations and instructions you submit.',
  ]},
  { title: 'Ride Sharing', paragraphs: [
    'Ride requests depend on driver, vehicle, route and location availability. A displayed fare may be an estimate or upfront quote. Permitted adjustments for a changed destination, additional stop, waiting time, toll or other disclosed factor will be shown in the app or applicable fare policy.',
    'Before boarding, check that the driver and vehicle reasonably match the details in the app. Do not board if they do not match. Follow road-safety laws, use seat belts or helmets as applicable, and do not ask a driver to break traffic laws or exceed vehicle capacity. Do not transport illegal, dangerous or prohibited goods. Cancellation, waiting and no-show charges will be disclosed in the app or service-specific policy.',
  ]},
  { title: 'Food Delivery', paragraphs: [
    'Menus, prices, descriptions, images, availability and preparation times are generally supplied by restaurants or merchants and may change. Restaurants are responsible for preparing the food and the accuracy of their product information, subject to applicable law. An order is placed when you confirm it; a restaurant may accept, reject or be unable to fulfil it.',
    'Delivery times are estimates and may be affected by traffic, weather, demand or other events. You must provide a correct address and remain reachable. Allergy and dietary information should be confirmed with the restaurant where needed; Dorkar cannot guarantee that a kitchen is free from a particular allergen. Cancellation and refund rules will be shown at checkout or in the applicable order policy.',
  ]},
  { title: 'Parcel Delivery', paragraphs: [
    'You must accurately describe and, where requested, declare the value of each parcel, package it securely, provide correct sender and recipient details and ensure the recipient can receive it. You remain responsible for the legality and safe packaging of the contents.',
    'Prohibited items include illegal drugs, weapons, explosives, flammable or hazardous substances, stolen or counterfeit goods, contraband, and any other item prohibited by law or the in-app restricted-items policy. A courier may refuse or stop a parcel that appears unsafe, prohibited, misdeclared or improperly packaged. Delivery confirmation, OTPs or proof-of-delivery records may be used. Report loss, damage or misdelivery promptly.',
  ]},
  { title: 'Blood Donation — special terms', paragraphs: [
    'The Blood Donation feature is a voluntary connection tool to help a person seeking blood find potential volunteer donors. It is not a blood bank, hospital, diagnostic service, medical provider or emergency response service, and it does not guarantee that blood or a donor will be available.',
    'A user may provide a blood group and opt in to donor discovery. The Platform may use the stated blood group, availability and approximate/current location to identify potential matches within an approximately 5 km radius, subject to permissions and technical accuracy. Donor participation is voluntary and may be paused or withdrawn.',
    'The planned four-month donor-cycle reset is an application workflow or reminder only. It is not medical clearance and does not establish that a person is fit to donate. Donors and seekers must confirm identity, blood group, compatibility, screening and eligibility through a qualified hospital, blood bank or healthcare professional. Never rely solely on an app profile or match for a transfusion decision.',
    'Dorkar does not collect, test, store, transport or supply blood. Do not offer or request payment for blood in violation of law or ethical rules. After a donor accepts a request, Dorkar may share the matched parties’ phone numbers and necessary coordination details as explained in the app. Do not harass, pressure or commercially exploit another participant. This feature is not for emergencies; contact emergency services or a hospital immediately in an urgent situation.',
  ]},
  { title: 'Pricing, payments, refunds and promotions', paragraphs: [
    'Applicable fares, prices, service fees, delivery charges, taxes, tips, waiting charges and other amounts will be displayed before confirmation where practicable. Prices may vary by distance, location, demand, provider and order contents. Payment methods may include cash, card, mobile financial services or other methods enabled in the app. Third-party payment providers may apply their own terms.',
    'You authorise the applicable charge when confirming a paid booking or order and must pay valid charges. Failed, reversed or disputed payments may lead to another payment request or temporary booking restrictions. Refund eligibility, timing and method depend on the service-specific policy, payment provider and applicable law. Nothing in these Terms removes mandatory consumer rights.',
    'Promotions and referral credits are subject to their displayed conditions and expiry dates. They may not be transferred, sold or redeemed for cash unless stated. Fraudulent or abusive use may result in cancellation of the benefit and account action.',
  ]},
  { title: 'Ratings and user content', paragraphs: [
    'Reviews, ratings, photographs and messages must be truthful, lawful and respectful and must not violate another person’s rights or privacy. You retain ownership of content you submit, but grant Dorkar a non-exclusive, worldwide, royalty-free licence to host, store, reproduce and display it as reasonably needed to operate, moderate, improve and promote the Platform, subject to the Privacy Policy and applicable law. We may remove unlawful, abusive, misleading or harmful content.',
  ]},
  { title: 'Safety, incidents and complaints', paragraphs: [
    'In immediate danger, an accident, injury, suspected crime or urgent medical situation, contact the appropriate emergency service or authority first. In-app reporting is not an emergency service. Report safety incidents, fraud, harassment, lost property, parcel damage, food issues or donation feature abuse promptly through [insert support channel]. We may review complaints, request information, restrict contact, suspend accounts, preserve records or cooperate with lawful requests.',
  ]},
  { title: 'Third-party services', paragraphs: [
    'The Platform may integrate maps, payment gateways, messaging, analytics, identity verification, app stores and other third-party services. Those services may have separate terms and privacy notices. Review those terms before using them.',
  ]},
  { title: 'Intellectual property', paragraphs: [
    'The Platform, software, design, logos, text, graphics and other Dorkar materials are owned by or licensed to Dorkar and protected by law. You receive a limited, revocable, non-exclusive and non-transferable licence to use the Platform for its intended purpose. You must not copy, modify, distribute, sell, reverse engineer or create derivative works except as permitted by law or with written permission.',
  ]},
  { title: 'Availability, suspension and termination', paragraphs: [
    'We may update, suspend, limit or discontinue a feature for maintenance, safety, legal, technical or business reasons. Uninterrupted availability is not guaranteed. We may restrict or suspend an account where we reasonably suspect fraud, unsafe conduct, non-payment, breach of these Terms or legal risk, and will provide notice or an appeal opportunity where appropriate and lawful.',
    'You may stop using the Platform and request account closure through [insert deletion route/support contact]. Outstanding payments, disputes, legal obligations and provisions that should survive termination by their nature may continue.',
  ]},
  { title: 'Disclaimers and liability', paragraphs: [
    'To the maximum extent permitted by law, the Platform is provided on an “as available” basis. We do not warrant uninterrupted or error-free operation, provider availability or completion of a request. To the maximum extent permitted by law, Dorkar is not liable for indirect, incidental, special or consequential loss, loss of profits, data or business interruption arising from use of the Platform.',
    'Nothing in these Terms excludes liability that cannot lawfully be excluded, including applicable statutory consumer rights or liability for fraud, wilful misconduct, death or personal injury where exclusion is prohibited. Responsibility between Dorkar and a Service Provider will be determined by the facts, applicable law and any separate agreement.',
  ]},
  { title: 'Indemnity', paragraphs: [
    'To the extent permitted by law, you agree to compensate Dorkar for reasonable losses and costs arising directly from your unlawful conduct, fraud, intentional misuse or material breach of these Terms. You are not required to indemnify Dorkar for Dorkar’s own negligence, wilful misconduct or non-excludable legal responsibility.',
  ]},
  { title: 'Changes to Terms', paragraphs: [
    'We may update these Terms to reflect changes in services, technology, safety or law. We will publish an updated version with a revised date and provide additional notice or obtain renewed consent where required. Continued use constitutes acceptance only to the extent permitted by law.',
  ]},
  { title: 'Governing law and disputes', paragraphs: [
    'These Terms are intended for use in Bangladesh and are governed by the laws of Bangladesh, subject to mandatory consumer and other legal rights. Please first contact Dorkar support to attempt resolution. Unresolved disputes may be brought before a court or competent forum with jurisdiction under applicable law. This clause does not prevent access to a regulator or statutory forum.',
  ]},
  { title: 'General', paragraphs: [
    'If a provision is invalid or unenforceable, the remaining provisions continue to apply to the extent possible. Failure to enforce a provision is not a waiver. You may not assign your rights or duties without written consent. These Terms, the Privacy Policy and any incorporated service-specific policy form the agreement concerning your use, subject to separate written agreements and mandatory law.',
  ]},
  { title: 'Contact', paragraphs: [
    'Operator: Dorkar Limited . Registered address:Bashundara R/A ,Dhaka,Bangladesh. Support:support@dorkar.com. Privacy contact: support@dorkar.com.',
  ]},
]

export default function TermsConditionsPage() {
  return <PolicyPage title="Terms & Conditions" updated="19 November 2026" intro={'These Terms & Conditions (“Terms”) govern access to and use of Dorkar’s website, mobile applications and related services Dorkar. “Dorkar”, “we”, “us” or “our” meansDorkar Limited. “You” or “User” means any customer, driver, rider, courier, restaurant, merchant, donor, seeker or other person using the Platform. By registering, accepting these Terms, requesting a service or using the Platform, you agree to these Terms and the Privacy Policy. If you do not agree, do not use the Platform. Dorkar is a multi-service platform intended to connect users in Bangladesh for Ride Sharing, Food Delivery, Parcel Delivery and Blood Donation coordination. Availability and features may vary.'} sections={sections}/>
}
