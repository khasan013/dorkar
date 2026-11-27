import { useCallback, useEffect, useRef, useState } from 'react'
import { redirectToLogin, readAuthSession } from '../../auth/session'
import CustomerLocationPicker from '../../components/CustomerLocationPicker'
import { getMyProfile } from '../../services/profileApi'
import { checkoutFoodCart, clearFoodCart, getFoodCart, updateFoodCart } from '../../services/foodOrderApi'
import { getPublicRestaurant } from '../../services/restaurantApi'
import './FoodOrderingPages.css'

const LOCAL_CART_KEY = 'dorkar-food-cart'
const PAYMENT_METHODS = [
  ['CASH_ON_DELIVERY', 'Cash on delivery'], ['BKASH', 'bKash'], ['NAGAD', 'Nagad'], ['CARD', 'Card'],
]

function readLocalCart() {
  try {
    const cart = JSON.parse(localStorage.getItem(LOCAL_CART_KEY) || 'null')
    return cart && Array.isArray(cart.items) ? cart : null
  } catch { return null }
}

function saveLocalCart(cart) {
  if (!cart?.items?.length) localStorage.removeItem(LOCAL_CART_KEY)
  else localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart))
}

function cartFromServer(remote) {
  if (!remote?.items?.length) return null
  return {
    restaurantId: remote.restaurantId,
    restaurantName: remote.restaurantName,
    items: remote.items.map(item => ({
      slug: item.slug,
      name: item.name,
      quantity: Number(item.quantity || 1),
      price: Number(item.unitPrice ?? item.price ?? 0),
      lineTotal: Number(item.lineTotal || 0),
    })),
    subtotal: Number(remote.subtotal || 0),
    deliveryFee: Number(remote.deliveryFee || 0),
    total: Number(remote.total || 0),
  }
}

function useFoodCart() {
  const session = readAuthSession()
  const token = session?.accessToken
  const initialCart = readLocalCart()
  const [cart, setCart] = useState(initialCart)
  const cartRef = useRef(initialCart)
  const [loading, setLoading] = useState(Boolean(token))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const requestQueue = useRef(Promise.resolve())

  const apply = useCallback(async nextCart => {
    cartRef.current = nextCart
    setCart(nextCart)
    saveLocalCart(nextCart)
    setError('')
    if (!token) return
    setSaving(true)
    requestQueue.current = requestQueue.current.catch(() => {}).then(() => nextCart?.items?.length
      ? updateFoodCart({
          restaurantId: nextCart.restaurantId,
          items: nextCart.items.map(item => ({ itemId: item.slug, quantity: item.quantity })),
        }, token)
      : clearFoodCart(token))
    try { await requestQueue.current }
    catch (reason) { setError(reason.message || 'Your cart could not be synced with the server.') }
    finally { setSaving(false) }
  }, [token])

  useEffect(() => {
    if (!token) { setLoading(false); return undefined }
    const controller = new AbortController()
    setLoading(true)
    getFoodCart(token, controller.signal).then(async remote => {
      if (controller.signal.aborted) return
      const serverCart = cartFromServer(remote)
      if (serverCart) {
        cartRef.current = serverCart; setCart(serverCart); saveLocalCart(serverCart)
      } else if (cartRef.current?.items?.length) {
        const local = cartRef.current
        const synced = await updateFoodCart({ restaurantId: local.restaurantId, items: local.items.map(item => ({ itemId: item.slug, quantity: item.quantity })) }, token)
        const normalized = cartFromServer(synced) || local
        cartRef.current = normalized; setCart(normalized); saveLocalCart(normalized)
      }
    }).catch(reason => {
      if (!controller.signal.aborted) setError(reason.message || 'Could not load your saved cart.')
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [token])

  const changeQuantity = async (slug, delta) => {
    const current = cartRef.current
    if (!current) return
    const items = current.items.map(item => item.slug === slug ? { ...item, quantity: item.quantity + delta } : item).filter(item => item.quantity > 0)
    await apply(items.length ? { ...current, items } : null)
  }

  const addItem = async (restaurant, item) => {
    const current = cartRef.current
    if (current && current.restaurantId !== restaurant.slug && !window.confirm(`Your cart has items from ${current.restaurantName}. Clear it and add from ${restaurant.name}?`)) return
    const base = current?.restaurantId === restaurant.slug ? current : { restaurantId: restaurant.slug, restaurantName: restaurant.name, items: [] }
    const existing = base.items.find(row => row.slug === item.slug)
    const items = existing
      ? base.items.map(row => row.slug === item.slug ? { ...row, quantity: row.quantity + 1 } : row)
      : [...base.items, { slug: item.slug, name: item.name, description: item.description, category: item.category, imageUrl: item.imageUrl, price: Number(item.price || 0), quantity: 1 }]
    await apply({ ...base, restaurantName: restaurant.name, items })
  }

  const clear = () => apply(null)
  return { cart, cartRef, token, session, loading, saving, error, setError, addItem, changeQuantity, clear }
}

function pageHeading(title, subtitle) {
  return <header className="food-order-heading"><span className="eyebrow">DORKAR FOOD</span><h1>{title}</h1><p>{subtitle}</p></header>
}

function ErrorNotice({ children }) { return children ? <p className="food-order-error" role="alert">{children}</p> : null }

function FoodQuantity({ quantity, onMinus, onPlus }) {
  return <div className="food-quantity"><button type="button" aria-label="Remove one" onClick={onMinus}>−</button><b>{quantity}</b><button type="button" aria-label="Add one" onClick={onPlus}>+</button></div>
}

export function FoodDetailsOrderPage() {
  const slug = new URLSearchParams(window.location.search).get('restaurant')
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(Boolean(slug))
  const [error, setError] = useState('')
  const cartState = useFoodCart()

  useEffect(() => {
    if (!slug) return undefined
    const controller = new AbortController()
    getPublicRestaurant(slug, controller.signal).then(setRestaurant).catch(reason => {
      if (reason.name !== 'AbortError') setError(reason.message || 'Restaurant could not be loaded.')
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [slug])

  if (!slug) return <section className="food-order-page">{pageHeading('Choose a restaurant', 'Open a restaurant from the food catalog to view its menu.')}<a className="button primary" href="/food/restaurants">Browse restaurants</a></section>
  if (loading) return <section className="food-order-page">{pageHeading('Loading menu', 'Getting the current restaurant menu…')}</section>
  if (error || !restaurant) return <section className="food-order-page">{pageHeading('Menu unavailable', error || 'This restaurant could not be found.')}<a className="button outline" href="/food/restaurants">Back to restaurants</a></section>

  const menu = (restaurant.menu || []).filter(item => item.available !== false)
  const count = cartState.cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0
  return <section className="food-order-page">
    <a className="food-back-link" href="/food/restaurants">← All restaurants</a>
    <header className="food-restaurant-hero">
      {restaurant.imageUrl ? <img src={restaurant.imageUrl} alt={`${restaurant.name} logo`}/> : <span>🍽</span>}
      <div><span className="eyebrow">{[restaurant.cuisine, restaurant.area].filter(Boolean).join(' · ')}</span><h1>{restaurant.name}</h1><p>{restaurant.description || 'Fresh meals prepared by your local restaurant.'}</p><small>★ {restaurant.rating || 'New'} · {restaurant.deliveryTime || 'Delivery time varies'} · {restaurant.address || restaurant.area || 'Location not listed'}</small></div>
    </header>
    <div className="food-menu-heading"><div><h2>Menu</h2><p>Prices are confirmed again by the server at checkout.</p></div><span>{menu.length} available {menu.length === 1 ? 'item' : 'items'}</span></div>
    {menu.length ? <div className="food-order-menu">{menu.map(item => <article className="food-order-item" key={item.slug}><div className="food-order-item-photo">{item.imageUrl ? <img src={item.imageUrl} alt=""/> : <span>🍽</span>}</div><div className="food-order-item-copy"><b>{item.name}</b><p>{item.description || item.category || 'Restaurant menu item'}</p><strong>৳ {Number(item.price || 0).toLocaleString('en-BD')}</strong></div><button className="food-add-button" type="button" disabled={cartState.loading || cartState.saving} onClick={() => cartState.addItem(restaurant, item)}>{cartState.loading ? 'Loading…' : 'Add'}</button></article>)}</div> : <div className="food-order-empty"><b>No items are available yet</b><p>This restaurant has not published menu items.</p></div>}
    <ErrorNotice>{cartState.error}</ErrorNotice>
    {count > 0 && <a className="food-cart-bar" href="/cart"><span>{count} {count === 1 ? 'item' : 'items'} · {cartState.saving ? 'Saving…' : 'Cart updated'}</span><b>View cart →</b></a>}
  </section>
}

export function FoodCartOrderPage() {
  const state = useFoodCart()
  const { cart } = state
  const subtotal = cart?.items?.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0) || 0
  const delivery = Number(cart?.deliveryFee ?? 50)
  return <section className="food-order-page">
    {pageHeading('Your cart', cart?.restaurantName ? `Order from ${cart.restaurantName}.` : 'Review your food items before checkout.')}
    {state.loading ? <div className="food-order-empty">Loading your saved cart…</div> : !cart?.items?.length ? <div className="food-order-empty"><b>Your cart is empty</b><p>Choose a restaurant and add dishes to get started.</p><a className="button primary" href="/food/restaurants">Browse restaurants</a></div> : <>
      <div className="food-cart-lines">{cart.items.map(item => <article className="food-cart-line" key={item.slug}><div className="food-order-item-photo">{item.imageUrl ? <img src={item.imageUrl} alt=""/> : <span>🍽</span>}</div><div className="food-order-item-copy"><b>{item.name}</b>{item.description && <p>{item.description}</p>}<strong>৳ {Number(item.price || 0).toLocaleString('en-BD')}</strong></div><FoodQuantity quantity={item.quantity} onMinus={() => state.changeQuantity(item.slug, -1)} onPlus={() => state.changeQuantity(item.slug, 1)}/></article>)}</div>
      <div className="food-order-summary"><div><span>Subtotal</span><b>৳ {subtotal.toLocaleString('en-BD')}</b></div><div><span>Delivery fee estimate</span><b>৳ {delivery.toLocaleString('en-BD')}</b></div><div className="food-total"><span>Estimated total</span><b>৳ {(subtotal + delivery).toLocaleString('en-BD')}</b></div><small>The server recalculates prices, availability, and delivery fee before placing the order.</small></div>
      <ErrorNotice>{state.error}</ErrorNotice>
      <div className="food-cart-actions"><button className="button outline" type="button" disabled={state.saving} onClick={state.clear}>Clear cart</button><a className={`button primary${state.saving ? ' is-disabled' : ''}`} href={state.saving ? undefined : '/checkout'}>Continue to checkout</a></div>
    </>}
  </section>
}

function accountPhone(user) {
  return user?.phone || user?.phoneNumber || user?.mobile || user?.contactPhone || ''
}

function validPhone(value) {
  const normalized = String(value || '').replace(/[\s()-]/g, '')
  return /^(\+?88)?01[3-9]\d{8}$/.test(normalized)
}

function normalizedPhone(value) { return String(value || '').replace(/[\s()-]/g, '') }

export function FoodCheckoutOrderPage() {
  const state = useFoodCart()
  const [location, setLocation] = useState(() => { try { return JSON.parse(localStorage.getItem('dorkar-selected-location') || 'null') } catch { return null } })
  const [phone, setPhone] = useState(() => accountPhone(readAuthSession()?.user))
  const [phoneEdited, setPhoneEdited] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    const token = state.token
    if (!token) return undefined
    const controller = new AbortController()
    getMyProfile(token, controller.signal).then(profile => {
      const saved = accountPhone(profile)
      if (saved && !phoneEdited) setPhone(saved)
    }).catch(() => {})
    return () => controller.abort()
  }, [state.token, phoneEdited])

  const address = location?.formattedAddress || location?.address || location?.manualAddress || ''
  const locationForOrder = value => setLocation(value)

  const placeOrder = async event => {
    event.preventDefault(); setFormError(''); state.setError('')
    if (!state.token) { redirectToLogin('/checkout'); return }
    if (!state.cart?.items?.length) { setFormError('Your cart is empty. Add a food item before checkout.'); return }
    if (!address.trim()) { setFormError('Choose a delivery address on the map or enter one below.'); return }
    if (!validPhone(phone)) { setFormError('Enter a valid Bangladesh mobile number.'); return }
    setSubmitting(true)
    try {
      await updateFoodCart({ restaurantId: state.cart.restaurantId, items: state.cart.items.map(item => ({ itemId: item.slug, quantity: item.quantity })) }, state.token)
      const order = await checkoutFoodCart({
        deliveryAddress: address.trim(),
        contactPhone: normalizedPhone(phone),
        paymentMethod,
        note: note.trim() || null,
        deliveryLatitude: location?.latitude ?? null,
        deliveryLongitude: location?.longitude ?? null,
      }, state.token)
      await clearFoodCart(state.token).catch(() => {})
      saveLocalCart(null)
      state.cartRef.current = null
      setSuccess(order)
    } catch (reason) {
      setFormError(reason.message || 'Your order could not be placed. Check the delivery details and try again.')
    } finally { setSubmitting(false) }
  }

  if (success) return <section className="food-order-page">{pageHeading('Order placed', 'The restaurant and Dorkar received your food order.')}<div className="food-order-success"><span>✓</span><h2>Thanks, your order is confirmed.</h2><p>{success.id ? `Order #${success.id} is now in your order history.` : 'You can track updates from your order history.'}</p><div><a className="button primary" href="/orders/history">View order history</a><a className="button outline" href="/food/restaurants">Browse more food</a></div></div></section>

  return <section className="food-order-page">
    {pageHeading('Checkout', 'Confirm the address and contact number for this delivery.')}
    {!state.token && <div className="food-order-empty"><b>Sign in to place your order</b><p>Your cart is saved on this device. Sign in to attach it to your account and continue.</p><button className="button primary" type="button" onClick={() => redirectToLogin('/checkout')}>Sign in to continue</button></div>}
    {state.cart?.items?.length > 0 && <div className="food-checkout-layout">
      <form className="food-checkout-form" onSubmit={placeOrder}>
        <section className="food-checkout-card"><h2>Delivery address</h2><CustomerLocationPicker compact label="Delivery address" value={location} onSelect={locationForOrder}/><label className="food-order-field"><span>Delivery address</span><input value={address} onChange={event => setLocation(current => ({ ...(current || {}), latitude: null, longitude: null, address: event.target.value, formattedAddress: event.target.value }))} placeholder="House, road, area" required maxLength={240}/></label><label className="food-order-field"><span>Delivery note <small>Optional</small></span><textarea value={note} onChange={event => setNote(event.target.value)} placeholder="Apartment, floor, or instructions for the rider" rows="3" maxLength={500}/></label></section>
        <section className="food-checkout-card"><h2>Contact phone</h2><label className="food-order-field"><span>Phone number</span><input value={phone} onChange={event => { setPhoneEdited(true); setPhone(event.target.value) }} placeholder="01XXXXXXXXX" type="tel" inputMode="tel" autoComplete="tel" required aria-invalid={Boolean(phone && !validPhone(phone) && phoneEdited)}/></label><small className="food-account-phone-hint">Prefilled from your Dorkar account. You can change it for this order.</small></section>
        <section className="food-checkout-card"><h2>Payment method</h2><div className="food-payment-options">{PAYMENT_METHODS.map(([value, label]) => <label key={value}><input type="radio" name="food-payment" checked={paymentMethod === value} onChange={() => setPaymentMethod(value)}/><span>{label}</span></label>)}</div></section>
        <ErrorNotice>{formError || state.error}</ErrorNotice>
        <button className="button primary food-place-order" type="submit" disabled={submitting || state.loading || state.saving}>{submitting ? 'Placing order…' : state.saving ? 'Saving cart…' : 'Place order'}</button>
      </form>
      <aside className="food-checkout-aside"><h2>{state.cart.restaurantName}</h2>{state.cart.items.map(item => <div key={item.slug}><span>{item.quantity} × {item.name}</span><b>৳ {(item.quantity * item.price).toLocaleString('en-BD')}</b></div>)}<p>Final total, availability, and delivery fee are confirmed by the server when you place the order.</p><a href="/cart">Edit cart</a></aside>
    </div>}
    {state.cart?.items?.length === 0 && !state.loading && state.token && <div className="food-order-empty"><b>Your cart is empty</b><p>Add food before you check out.</p><a className="button primary" href="/food/restaurants">Browse restaurants</a></div>}
  </section>
}
