const groups = [
  {
    title: 'Our services',
    links: [
      ['Ride sharing', '/ride'],
      ['Food delivery', '/food'],
      ['Parcel delivery', '/parcel'],
      ['Blood donation', '/blood'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['About Dorkar', '/about'],
      ['Partner with us', '/partner'],
      ['Contact us', '/contact'],
      ['Help & support', '/support'],
    ],
  },
]

function Brand() {
  return (
    <a className="brand footer-brand" href="/" aria-label="Dorkar home">
      <img className="brand-symbol" src="/D-Logo-transparent.png" alt="" />
      <span>Dorkar</span>
    </a>
  )
}

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-intro">
          <Brand />
          <p>Everyday rides, meals, deliveries, and community care — together in one app.</p>
          <span className="footer-country">Made for Bangladesh</span>
        </div>

        {groups.map((group) => (
          <nav className="footer-column" aria-label={group.title} key={group.title}>
            <h2>{group.title}</h2>
            {group.links.map(([label, href]) => <a href={href} key={href}>{label}</a>)}
          </nav>
        ))}

        <div className="footer-contact">
          <h2>Need a hand?</h2>
          <p>Find answers to common questions or send the Dorkar team a support request.</p>
          <a className="footer-contact-link" href="/support">Visit Help & Support →</a>
          <a className="footer-contact-link" href="/contact">Contact the Dorkar team →</a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Dorkar. All rights reserved.</span>
        <div>
          <a href="/terms">Terms & Conditions</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/contact">Contact</a>
        </div>
        <div className="footer-social" role="group" aria-label="Social media">
          <span aria-label="Facebook" title="Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.02 10.13 11.89v-8.41H7.08v-3.48h3.05V9.43c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.95h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.48h-2.8v8.41C19.61 23.09 24 18.09 24 12.07Z"/></svg></span>
          <span aria-label="Instagram" title="Instagram"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle className="instagram-dot" cx="17.5" cy="6.8" r="1"/></svg></span>
        </div>
      </div>
    </footer>
  )
}
