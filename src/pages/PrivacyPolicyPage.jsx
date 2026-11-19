import PolicyPage from './PolicyPage'

const sections = [
  { title: 'Information we collect', paragraphs: [
    'Account and identity: name, mobile number, email, age or date of birth, profile photo, credentials, verification status and documents supplied for identity or provider onboarding.',
    'Location: approximate or precise device location, GPS coordinates, pickup/drop-off points, delivery addresses, route information, location history associated with bookings and location shared with a matched provider, donor or seeker.',
    'Ride information: trip requests, driver and vehicle details, routes, times, fares, cancellations, trip status, ratings and support records.',
    'Food information: restaurant and menu selections, order contents, delivery instructions, addresses, order status, payment status, ratings and complaints. Allergy or dietary notes may reveal health-related information.',
    'Parcel information: sender and recipient names and contact details, addresses, parcel description, declared value, instructions, proof of delivery and incident records.',
    'Blood Donation information: self-reported blood group, donor opt-in, availability, donation cycle dates/reminders, location/radius matching, blood request details and contact details shared after a match. This may be sensitive or health-related personal information.',
    'Payment information: payment method type, transaction references, amounts, status, refunds and billing records. Full payment credentials should normally be handled by the payment provider.',
    'Device and technical data: IP address, device type, operating system, app version, language, crash logs, diagnostic events, cookies or similar technologies and security logs.',
    'Communications: support messages, ratings, complaints, reports and other information you provide. Call or message metadata may be processed where those features are enabled and lawfully disclosed.',
  ]},
  { title: 'How we collect information', paragraphs: [
    'We collect information directly when you register, update a profile, request a ride, place an order, book a parcel, opt into donor discovery, submit a blood request or contact support. We may receive information from Service Providers, restaurants, merchants, payment processors, identity vendors, map providers, device operating systems and other users involved in a booking. Some technical and location data is collected automatically, subject to permissions and applicable law.',
  ]},
  { title: 'How we use information', paragraphs: [
    'We use information to create and manage accounts; verify identity and eligibility; match users with drivers, couriers, restaurants, donors or seekers; calculate estimates; process bookings and orders; provide route, delivery and status updates; facilitate payments and refunds; and provide support.',
    'We use location to find nearby services, calculate routes and distances, track active rides or parcels and, for Blood Donation, identify potential matches within the configured radius (planned at about 5 km). We use blood group, donor opt-in and donation-cycle information only as needed to operate voluntary donor discovery and relevant notifications. A four-month app cycle is not medical advice or a determination of donor eligibility.',
    'We also use information for safety, fraud prevention, incident investigation, enforcement of Terms, security, troubleshooting, service improvement, analytics and compliance with lawful requests. Aggregated or de-identified data may be used for analytics and planning.',
  ]},
  { title: 'How information is shared', paragraphs: [
    'With matched Service Providers: a driver may receive the rider’s name and trip details; a restaurant may receive order details; a courier may receive sender/recipient and delivery details; and a matched donor or seeker may receive limited coordination information.',
    'For Blood Donation, donor information should be limited before a match to what is needed for discovery, such as blood group, approximate distance and availability. After acceptance, Dorkar may share the matched parties’ phone numbers and necessary coordination details as disclosed in the feature and consent flow. Precise donor location must not be publicly exposed.',
    'We may share relevant data with payment gateways, cloud hosting, maps, messaging, analytics, identity verification, customer support and security vendors; with authorities where legally required or reasonably necessary to protect users or investigate fraud; and as part of a lawful merger, restructuring or business transfer subject to applicable law.',
    'We do not sell personal information as a standalone data-broker product. Any future advertising, profiling or new data-sharing purpose must be assessed, disclosed and consented to where required.',
  ]},
  { title: 'Location permissions', paragraphs: [
    'Location access may be requested to find nearby providers, set pickup/delivery points, estimate routes, provide live tracking and match potential donors and seekers. You can manage permissions through device settings; disabling location may require manual address entry or limit some features. The app should clearly indicate when live location is active and who can see it.',
  ]},
  { title: 'Sensitive data and Blood Donation', paragraphs: [
    'Blood group, donor status, donation history and some allergy notes may be sensitive or health-related. Dorkar should collect them only when necessary, explain the purpose and obtain the consent or other lawful basis required by Bangladesh law. Donor registration must be voluntary. Donors should be able to pause availability, withdraw from future matching and request correction of inaccurate data.',
    'The four-month donor-cycle workflow is only an app reminder or availability rule, not medical clearance. Dorkar does not determine donor fitness or blood compatibility. Users must consult qualified medical professionals and authorised blood services. Blood group and donor status must not be used for unrelated advertising or public profiling. Access should be restricted to authorised staff and the minimum necessary service participants.',
  ]},
  { title: 'Consent, lawful use and your choices', paragraphs: [
    'Depending on the purpose and applicable law, Dorkar may process information based on consent, steps needed to provide a requested service, legal obligations, protection of vital interests or another lawful basis. Where consent is required, it will be requested clearly and specifically. You may withdraw consent through settings or by contacting us; withdrawal does not invalidate prior lawful processing and may make a feature unavailable.',
    'You can update certain profile details, manage device permissions and notification preferences, and opt out of promotional messages. Essential booking, account-security and service messages may still be sent.',
  ]},
  { title: 'Retention', paragraphs: [
    'We retain personal information only as long as reasonably necessary for service delivery, account administration, safety, fraud prevention, disputes, accounting, tax, regulatory and legal requirements. Different records may have different periods. Dorkar must set a documented retention schedule before launch for accounts, trips, orders, parcels, payments, incidents, support and donor matching.',
    'When information is no longer needed, we will take reasonable steps to delete, anonymise or securely dispose of it, subject to backups, legal holds and mandatory retention requirements.',
  ]},
  { title: 'Security and breach response', paragraphs: [
    'We use reasonable technical, organisational and administrative safeguards designed to protect information, which may include access controls, encryption in transit, secure authentication, logs, backups, vendor controls and staff confidentiality obligations. No internet system is completely secure. Protect your device and OTPs and report suspected account compromise promptly. Dorkar will assess and respond to personal data breaches in accordance with applicable legal requirements, including required notices.',
  ]},
  { title: 'Vendors and international processing', paragraphs: [
    'Some technology providers may process or store information outside Bangladesh. Before any cross-border transfer, Dorkar must verify applicable legal requirements, transfer conditions, safeguards, vendor terms and user disclosures. Vendors processing information for Dorkar must be contractually required to use it only for authorised purposes and protect it appropriately.',
  ]},
  { title: 'Cookies and analytics', paragraphs: [
    'The website may use essential cookies for secure sessions and core functions. With notice and consent where required, analytics tools may be used to understand usage and improve performance. You can manage cookies through browser settings; blocking essential cookies may affect sign-in or other functions. Mobile apps may use device identifiers or SDKs for operational and analytics purposes subject to settings and law.',
  ]},
  { title: 'Children’s privacy', paragraphs: [
    'Dorkar accounts and services are generally intended for adults. We do not knowingly create independent accounts for children where prohibited by law. If a parent or guardian believes a child has provided information improperly, contact us so we can review and take appropriate action. Any service involving a minor must follow applicable law and guardian requirements.',
  ]},
  { title: 'Your privacy rights', paragraphs: [
    'Subject to applicable law and identity verification, you may have rights to request access, correction, deletion or erasure, withdrawal of consent, objection or restriction of certain processing, portability and information about how your data is used or shared. Contact [insert privacy email] with your request. We may need to verify your identity and may retain information where law permits or requires. You may also complain to a competent Bangladesh authority or seek a legal remedy.',
  ]},
  { title: 'Marketing and notifications', paragraphs: [
    'Operational messages about accounts, bookings, rides, orders, parcels, opted-in donor requests, payments and support may be sent as needed. Promotional messages will be sent only where permitted and with consent where required. You can opt out of marketing; essential service and security messages may continue.',
  ]},
  { title: 'Third-party links', paragraphs: [
    'Links to third-party websites or services are governed by their own privacy notices. Review those notices before providing information to those services.',
  ]},
  { title: 'Policy changes', paragraphs: [
    'We may update this Policy when services, data practices or legal requirements change. We will publish the revised version with an updated date and provide additional notice or obtain consent where required. Material changes to sensitive-data processing, donor matching or contact sharing should be communicated before the new practice begins.',
  ]},
  { title: 'Privacy contact', paragraphs: [
    'Operator: Dorkar Limited . Registered address:Bashundara R/A ,Dhaka,Bangladesh.',
  ]},
]

export default function PrivacyPolicyPage() {
  return <PolicyPage title="Privacy Policy" updated="19 November 2026" intro={'This Privacy Policy explains how Dorkar Limited  collects, uses, stores, shares and protects personal information when you use the Dorkar website, mobile applications and related services in Bangladesh. It applies to customers, drivers, riders, couriers, restaurants, merchants, blood donors, blood seekers and visitors. This notice explains Dorkar’s collection, use, storage and sharing of personal information.'} sections={sections}/>
}
