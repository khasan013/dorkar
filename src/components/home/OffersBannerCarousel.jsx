import { useEffect, useMemo, useState } from 'react'
import { getActiveBanners } from '../../services/bannerApi'
import './OffersBannerCarousel.css'

function bannerDestination(banner) {
  const targetType = String(banner.targetType || 'none').toLowerCase()
  const destinations = {
    ride: '/ride',
    food: '/food',
    parcel: '/parcel',
    blood: '/blood',
  }

  if (targetType === 'none') return null
  if (targetType === 'external') {
    try {
      const target = new URL(banner.targetUrl)
      return ['http:', 'https:'].includes(target.protocol) ? { href: target.href, external: true } : null
    } catch {
      return null
    }
  }
  if (targetType === 'restaurant' && banner.targetId) {
    return { href: `/food/restaurants/${encodeURIComponent(banner.targetId)}` }
  }
  if (targetType === 'offer' && banner.targetId) {
    return { href: `/offers/${encodeURIComponent(banner.targetId)}` }
  }
  return destinations[targetType] ? { href: destinations[targetType] } : null
}

function ArrowIcon({ direction }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    {direction === 'previous'
      ? <path d="m14.5 5-7 7 7 7" />
      : <path d="m9.5 5 7 7-7 7" />}
  </svg>
}

export default function OffersBannerCarousel() {
  const [banners, setBanners] = useState([])
  const [index, setIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [isHidden, setIsHidden] = useState(() => document.visibilityState === 'hidden')

  useEffect(() => {
    const controller = new AbortController()
    getActiveBanners(controller.signal)
      .then(items => setBanners(items.filter(item => typeof item?.imageUrl === 'string' && item.imageUrl.trim())))
      .catch(error => {
        if (error.name !== 'AbortError') setBanners([])
      })
    return () => controller.abort()
  }, [])

  const current = banners[index]
  const destination = useMemo(() => current ? bannerDestination(current) : null, [current])
  const hasMultiple = banners.length > 1
  const duration = Number(current?.durationSeconds) === 8 ? 8000 : 5000

  useEffect(() => {
    if (!hasMultiple) return undefined
    const onVisibilityChange = () => setIsHidden(document.visibilityState === 'hidden')
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [hasMultiple])

  useEffect(() => {
    if (!hasMultiple || isHovering || isHidden) return undefined
    const timer = window.setTimeout(() => setIndex(value => (value + 1) % banners.length), duration)
    return () => window.clearTimeout(timer)
  }, [banners.length, duration, hasMultiple, index, isHidden, isHovering])

  useEffect(() => {
    if (!hasMultiple) return
    const nextBanner = banners[(index + 1) % banners.length]
    if (nextBanner?.imageUrl) {
      const image = new Image()
      image.src = nextBanner.imageUrl
    }
  }, [banners, hasMultiple, index])

  if (!current) return null

  const bannerImage = current.mobileImageUrl
    ? <picture key={current.id ?? current.imageUrl}><source media="(max-width: 720px)" srcSet={current.mobileImageUrl}/><img src={current.imageUrl} alt={current.altText || current.title || 'Dorkar offer'} /></picture>
    : <img key={current.id ?? current.imageUrl} src={current.imageUrl} alt={current.altText || current.title || 'Dorkar offer'} />
  const move = offset => setIndex(value => (value + offset + banners.length) % banners.length)

  return <section
    className="offers-carousel section-shell"
    aria-label="Current offers"
    onMouseEnter={() => setIsHovering(true)}
    onMouseLeave={() => setIsHovering(false)}
  >
    <div className="offers-carousel-frame" aria-live="off">
      {destination
        ? <a className="offers-carousel-image-link" href={destination.href} target={destination.external ? '_blank' : undefined} rel={destination.external ? 'noopener noreferrer' : undefined} aria-label={current.title || 'View offer'}>{bannerImage}</a>
        : bannerImage}
      {hasMultiple && <>
        <button className="offers-carousel-control previous" type="button" onClick={() => move(-1)} aria-label="Previous offer"><ArrowIcon direction="previous"/></button>
        <button className="offers-carousel-control next" type="button" onClick={() => move(1)} aria-label="Next offer"><ArrowIcon direction="next"/></button>
      </>}
    </div>
    {hasMultiple && <div className="offers-carousel-indicators" role="group" aria-label="Choose an offer">
      {banners.map((banner, slideIndex) => <button
        key={banner.id ?? `${banner.imageUrl}-${slideIndex}`}
        className={slideIndex === index ? 'is-active' : ''}
        type="button"
        onClick={() => setIndex(slideIndex)}
        aria-label={`Show offer ${slideIndex + 1}`}
        aria-current={slideIndex === index ? 'true' : undefined}
      />)}
    </div>}
  </section>
}
