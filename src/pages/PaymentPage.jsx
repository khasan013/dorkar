import { useState } from 'react'
import walletIllustration from '../assets/Wallet.png'

const methods = [
  { id: 'card', title: 'Credit / Debit Card', description: 'Visa, Mastercard, AMEX accepted', icon: 'card' },
  { id: 'bkash', title: 'bKash', description: 'Pay safely with your bKash account', icon: 'bkash' },
  { id: 'nagad', title: 'Nagad', description: 'Pay safely with your Nagad account', icon: 'nagad' },
  { id: 'cash', title: 'Cash on Delivery', description: 'Pay in cash when you receive your service', icon: 'cash' },
]

function PaymentMark({ type }) {
  if (type === 'card') return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18m-14 5h4"/></svg>
  if (type === 'cash') return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 9h.01M18 15h.01"/></svg>
  if (type === 'bkash') return <span className="pay-brand-mark bkash-mark" aria-hidden="true">b</span>
  return <span className="pay-brand-mark nagad-mark" aria-hidden="true">N</span>
}

function NetworkMarks() {
  return <div className="pay-networks" aria-label="Visa, Mastercard, and American Express"><span className="visa-mark">VISA</span><span className="mastercard-mark"><i/><i/></span><span className="amex-mark">AMEX</span></div>
}

export default function PaymentPage() {
  const [selected, setSelected] = useState(() => localStorage.getItem('dorkar-payment-preference') || 'card')
  const [saved, setSaved] = useState(false)
  const [cards, setCards] = useState([{ id: 'preview-card', last4: '4587', expiry: '12/28', network: 'VISA', isDefault: true }])
  const [modalOpen, setModalOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)
  const [notice, setNotice] = useState('')

  const savePreference = (event) => {
    event.preventDefault()
    localStorage.setItem('dorkar-payment-preference', selected)
    setSaved(true)
    setNotice('Your payment preference has been saved in this preview.')
  }

  const addCard = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const digits = String(data.get('cardNumber')).replace(/\D/g, '')
    const expiry = String(data.get('expiry')).trim()
    const next = { id: `card-${Date.now()}`, last4: digits.slice(-4), expiry, network: digits.startsWith('5') ? 'MASTERCARD' : 'VISA', isDefault: data.get('defaultCard') === 'on' || cards.length === 0 }
    setCards(current => current.map(card => next.isDefault ? { ...card, isDefault: false } : card).concat(next))
    form.reset()
    setModalOpen(false)
    setSaved(false)
    setNotice('Only the masked card ending and expiry are shown in this preview. Connect a PCI-compliant provider to tokenize cards.')
  }

  const removeCard = (card) => {
    if (!window.confirm(`Remove the card ending in ${card.last4}?`)) return
    setCards(current => current.filter(item => item.id !== card.id))
    setOpenMenu(null)
  }

  const makeDefault = (card) => {
    setCards(current => current.map(item => ({ ...item, isDefault: item.id === card.id })))
    setOpenMenu(null)
  }

  return <main className="payment-page">
    <section className="payment-hero">
      <div className="payment-hero-copy"><span className="eyebrow">DORKAR</span><h1>Choose how to pay</h1><p>Manage your payment methods for a faster and smoother experience.</p></div>
      <img className="payment-hero-image" src={walletIllustration} alt="Red wallet with payment cards and security shield" />
    </section>

    <div className="payment-layout">
      <form className="payment-methods-card" onSubmit={savePreference}>
        <h2>Payment Methods</h2>
        <div className="payment-method-list">
          {methods.map(method => <label className={`payment-method-option${selected === method.id ? ' is-selected' : ''}`} key={method.id}>
            <input type="radio" name="paymentMethod" value={method.id} checked={selected === method.id} onChange={() => { setSelected(method.id); setSaved(false); setNotice('') }} />
            <span className={`payment-method-icon ${method.icon}`}><PaymentMark type={method.icon}/></span>
            <span className="payment-method-copy"><b>{method.title}</b><small>{method.description}</small></span>
            {method.id === 'card' ? <NetworkMarks/> : <span className="payment-method-arrow" aria-hidden="true">›</span>}
          </label>)}
        </div>
        <button className="payment-save-button" type="submit">Save Preference</button>
        {saved && notice && <p className="payment-notice" role="status">{notice}</p>}
      </form>

      <aside className="payment-side-column">
        <section className="saved-cards-card">
          <div className="saved-cards-heading"><span><PaymentMark type="card"/></span><h2>Saved Cards</h2></div>
          {cards.length ? <div className="saved-card-list">{cards.map(card => <article className="saved-card-row" key={card.id}>
            <div className="saved-card-visual"><div className="saved-card-network">{card.network}</div><b>•••• •••• •••• {card.last4}</b><small>Expires {card.expiry}</small>{card.isDefault && <span className="saved-card-default">Default</span>}</div>
            <div className="saved-card-menu-wrap"><button className="saved-card-menu-button" type="button" aria-label={`Actions for card ending ${card.last4}`} aria-expanded={openMenu === card.id} onClick={() => setOpenMenu(openMenu === card.id ? null : card.id)}>⋮</button>{openMenu === card.id && <div className="saved-card-menu"><button type="button" onClick={() => makeDefault(card)} disabled={card.isDefault}>Set as default</button><button type="button" onClick={() => removeCard(card)}>Remove card</button></div>}</div>
          </article>)}</div> : <div className="saved-card-empty"><PaymentMark type="card"/><b>No saved cards</b><p>Add a card to keep it available for future payments.</p></div>}
          <button className="payment-add-card-button" type="button" onClick={() => setModalOpen(true)}><span>＋</span> Add New Card</button>
          <div className="payment-security-note"><span className="payment-lock-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/></svg></span><div><b>Protect your payment details</b><p>Card numbers and security codes are not saved in this preview. Payment processing needs a PCI-compliant provider.</p></div></div>
        </section>
      </aside>
    </div>

    {notice && !saved && <p className="payment-notice payment-global-notice" role="status">{notice}</p>}
    {modalOpen && <div className="payment-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setModalOpen(false) }}><section className="payment-add-modal" role="dialog" aria-modal="true" aria-labelledby="add-card-title">
      <button className="payment-modal-close" type="button" onClick={() => setModalOpen(false)} aria-label="Close">×</button><span className="payment-modal-icon"><PaymentMark type="card"/></span><h2 id="add-card-title">Add a new card</h2><p>Card details are used only in this temporary preview.</p>
      <form onSubmit={addCard}>
        <label className="payment-form-field"><span>Cardholder name</span><input name="cardholder" autoComplete="cc-name" placeholder="Name on card" required/></label>
        <label className="payment-form-field"><span>Card number</span><input name="cardNumber" autoComplete="cc-number" inputMode="numeric" maxLength="23" pattern="[0-9 ]{12,23}" placeholder="1234 5678 9012 3456" required title="Enter a card number using digits and spaces"/></label>
        <div className="payment-modal-row"><label className="payment-form-field"><span>Expiry date</span><input name="expiry" autoComplete="cc-exp" placeholder="MM/YY" pattern="(0[1-9]|1[0-2])/[0-9]{2}" required/></label><label className="payment-form-field"><span>CVV</span><input name="cvv" type="password" autoComplete="cc-csc" inputMode="numeric" maxLength="4" pattern="[0-9]{3,4}" placeholder="•••" required/></label></div>
        <label className="payment-default-check"><input type="checkbox" name="defaultCard"/><span>Set as default card</span></label>
        <div className="payment-modal-actions"><button type="button" className="payment-cancel-button" onClick={() => setModalOpen(false)}>Cancel</button><button className="payment-save-button" type="submit">Save Card</button></div>
      </form>
    </section></div>}
  </main>
}
