import { useCallback, useEffect, useMemo, useState } from 'react'
import { readAuthSession } from '../../auth/session'
import {
  createAdminPromotion, createAdminCoupon, createAdminBanner,
  deleteAdminPromotion, deleteAdminCoupon, deleteAdminBanner,
  getAdminPromotionSummary, getAdminPromotions, getAdminCoupons, getAdminBanners,
  setAdminPromotionStatus, setAdminCouponStatus, setAdminBannerStatus,
  updateAdminPromotion, updateAdminCoupon, updateAdminBanner, uploadAdminBannerImage,
} from '../../services/promotionApi'
import AdminLayout, { AdminIcon } from './AdminLayout'
import './PromotionsPage.css'

const tabs = [
  { id: 'promotions', label: 'All Promotions' },
  { id: 'banners', label: 'Homepage Banners' },
  { id: 'coupons', label: 'Coupons' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'expired', label: 'Expired' },
]
const serviceLabel = value => ({ ALL: 'All services', RIDE: 'Ride', FOOD: 'Food', PARCEL: 'Parcel', BLOOD: 'Blood donation' }[String(value || 'ALL').toUpperCase()] || value)
const titleCase = value => String(value || '').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, char => char.toUpperCase())
const money = value => value == null ? '—' : `৳ ${Number(value).toLocaleString('en-BD', { maximumFractionDigits: 2 })}`
const shortDate = value => value ? new Intl.DateTimeFormat('en-BD', { dateStyle: 'medium' }).format(new Date(value)) : 'No end date'
const toLocalDateTime = value => {
  if (!value) return ''
  const date = new Date(value)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}
const effectiveStatus = item => {
  const now = Date.now()
  if (item.endAt && new Date(item.endAt).getTime() <= now && ['ACTIVE', 'SCHEDULED'].includes(item.status)) return 'EXPIRED'
  if (item.startAt && new Date(item.startAt).getTime() > now && item.status === 'ACTIVE') return 'SCHEDULED'
  if (item.status === 'SCHEDULED' && (!item.startAt || new Date(item.startAt).getTime() <= now)) return 'ACTIVE'
  return item.status || 'DRAFT'
}
const dataForTab = { promotions: getAdminPromotions, coupons: getAdminCoupons, banners: getAdminBanners }

function Status({ value }) {
  const kind = String(value || 'DRAFT').toLowerCase()
  return <span className={`promo-status ${kind}`}><i/>{titleCase(value || 'Draft')}</span>
}

function Stat({ icon, label, value, note, tone }) {
  const display = value == null ? '—' : typeof value === 'string' ? value : Number(value).toLocaleString('en-BD')
  return <article className={`promo-stat ${tone}`}><span><AdminIcon name={icon} size={20}/></span><div><small>{label}</small><b>{display}</b><p>{note}</p></div></article>
}

export default function PromotionsPage() {
  const session = readAuthSession()
  const token = session?.accessToken
  const [tab, setTab] = useState('promotions')
  const [rows, setRows] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [serviceFilter, setServiceFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const [editor, setEditor] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const pageSize = 8

  const load = useCallback(async signal => {
    setLoading(true)
    setError('')
    try {
      const [summaryResult, rowResult] = await Promise.all([
        getAdminPromotionSummary(token, signal),
        tab === 'scheduled' || tab === 'expired'
          ? Promise.all([getAdminPromotions(token, signal), getAdminCoupons(token, signal), getAdminBanners(token, signal)]).then(lists => lists.flat())
          : dataForTab[tab](token, signal),
      ])
      setSummary(summaryResult || null)
      setRows(Array.isArray(rowResult) ? rowResult : [])
    } catch (requestError) {
      if (requestError.name !== 'AbortError') {
        setError(requestError.status === 401 || requestError.status === 403
          ? 'Your administrator session expired or does not have access to promotions.'
          : requestError.message || 'Promotions could not be loaded.')
        setRows([])
        setSummary(null)
      }
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [tab, token])

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  useEffect(() => () => { if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview) }, [imagePreview])

  const visibleRecords = useMemo(() => {
    const text = query.trim().toLowerCase()
    const now = Date.now()
    return rows.filter(item => {
      const type = String(item.recordType || (tab === 'scheduled' || tab === 'expired' ? item.bannerImageUrl ? 'banner' : item.code ? 'coupon' : 'promotion' : tab.slice(0, -1))).toLowerCase()
      const isExpired = item.status === 'EXPIRED' || (item.endAt && new Date(item.endAt).getTime() <= now)
      const isScheduled = item.status === 'SCHEDULED' || (item.startAt && new Date(item.startAt).getTime() > now)
      if (tab === 'expired' && !isExpired) return false
      if (tab === 'scheduled' && (!isScheduled || isExpired)) return false
      if (tab !== 'scheduled' && tab !== 'expired' && type !== tab.slice(0, -1)) return false
      const fields = [item.name, item.title, item.code, item.description, item.serviceType, item.targetType]
      const matchesText = !text || fields.some(value => String(value || '').toLowerCase().includes(text))
      const matchesStatus = statusFilter === 'ALL' || effectiveStatus(item) === statusFilter
      const matchesService = serviceFilter === 'ALL' || String(item.serviceType || 'ALL').toUpperCase() === serviceFilter
      return matchesText && matchesStatus && matchesService
    })
  }, [rows, query, statusFilter, serviceFilter, tab])

  const totalPages = Math.max(1, Math.ceil(visibleRecords.length / pageSize))
  const pageRows = visibleRecords.slice((page - 1) * pageSize, page * pageSize)

  const selectTab = next => { setTab(next); setPage(1); setQuery(''); setStatusFilter('ALL'); setServiceFilter('ALL') }
  const startCreate = (kind = tab === 'banners' ? 'banner' : tab === 'coupons' ? 'coupon' : 'promotion', source = null, duplicate = false) => {
    setImagePreview(source?.bannerImageUrl || '')
    setEditor({ kind, source, duplicate })
    setError('')
    setNotice('')
  }

  const handleImage = event => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) {
      setError('Choose a JPG, PNG, or WebP banner image up to 8 MB.')
      event.target.value = ''
      return
    }
    setImagePreview(URL.createObjectURL(file))
    setEditor(current => ({ ...current, file }))
    setError('')
  }

  const handleMobileImage = event => {
    const file = event.currentTarget.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) {
      setError('Choose a JPG, PNG, or WebP mobile image up to 8 MB.')
      event.currentTarget.value = ''
      return
    }
    setEditor(current => ({ ...current, mobileFile: file }))
    setError('')
  }

  const saveRecord = async event => {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity()) return
    const fields = new FormData(form)
    const kind = editor.kind
    const source = editor.source
    const status = fields.get('status')
    const body = {
      name: String(fields.get('name') || '').trim(),
      title: String(fields.get('name') || '').trim(),
      description: String(fields.get('description') || '').trim(),
      discountType: fields.get('discountType'),
      discountValue: Number(fields.get('discountValue') || 0),
      minOrderAmount: fields.get('minOrderAmount') ? Number(fields.get('minOrderAmount')) : null,
      maxDiscountAmount: fields.get('maxDiscountAmount') ? Number(fields.get('maxDiscountAmount')) : null,
      serviceType: fields.get('serviceType'),
      startAt: fields.get('startAt') ? new Date(fields.get('startAt')).toISOString() : null,
      endAt: fields.get('endAt') ? new Date(fields.get('endAt')).toISOString() : null,
      totalUsageLimit: fields.get('totalUsageLimit') ? Number(fields.get('totalUsageLimit')) : null,
      perCustomerLimit: fields.get('perCustomerLimit') ? Number(fields.get('perCustomerLimit')) : null,
      status,
    }
    setSaving(true)
    setError('')
    try {
      if (kind === 'banner') {
        let uploaded = null
        let uploadedMobile = null
        if (editor.file) uploaded = await uploadAdminBannerImage(editor.file, token)
        if (editor.mobileFile) uploadedMobile = await uploadAdminBannerImage(editor.mobileFile, token)
        const banner = {
          name: body.name,
          desktopImageUrl: uploaded?.secureUrl || source?.desktopImageUrl || source?.bannerImageUrl,
          desktopPublicId: uploaded?.publicId || source?.desktopPublicId,
          mobileImageUrl: uploadedMobile?.secureUrl || source?.mobileImageUrl || null,
          mobilePublicId: uploadedMobile?.publicId || source?.mobilePublicId || null,
          targetType: fields.get('targetType'),
          targetId: String(fields.get('targetId') || '').trim() || null,
          targetUrl: String(fields.get('targetUrl') || '').trim() || null,
          displayOrder: Number(fields.get('displayOrder') || 0),
          durationSeconds: Number(fields.get('durationSeconds') || 5),
          startAt: body.startAt,
          endAt: body.endAt,
          status,
        }
        if (source && !editor.duplicate) await updateAdminBanner(source.id, banner, token)
        else await createAdminBanner(banner, token)
      } else {
        const isCoupon = kind === 'coupon'
        const payload = isCoupon ? { ...body, code: String(fields.get('code') || '').trim().toUpperCase() } : body
        if (source && !editor.duplicate) {
          if (isCoupon) await updateAdminCoupon(source.id, payload, token)
          else await updateAdminPromotion(source.id, payload, token)
        } else if (isCoupon) await createAdminCoupon(payload, token)
        else await createAdminPromotion(payload, token)
      }
      setEditor(null)
      setImagePreview('')
      setNotice('Saved successfully.')
      const nextTab = kind === 'banner' ? 'banners' : kind === 'coupon' ? 'coupons' : 'promotions'
      if (tab !== nextTab) setTab(nextTab)
      else await load()
    } catch (requestError) {
      setError(requestError.message || 'The record could not be saved.')
    } finally { setSaving(false) }
  }

  const changeStatus = async item => {
    const kind = item.bannerImageUrl || item.desktopImageUrl ? 'banner' : item.code ? 'coupon' : 'promotion'
    const currentStatus = effectiveStatus(item)
    if (currentStatus === 'EXPIRED') return
    const next = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    if (next === 'PAUSED' && !window.confirm(`Pause “${item.name || item.title || item.code}”?`)) return
    try {
      if (kind === 'banner') await setAdminBannerStatus(item.id, next === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE', token)
      else if (kind === 'coupon') await setAdminCouponStatus(item.id, next, token)
      else await setAdminPromotionStatus(item.id, next, token)
      setNotice(`Status changed to ${titleCase(next)}.`)
      await load()
    } catch (requestError) { setError(requestError.message || 'Status could not be changed.') }
  }

  const removeRecord = async item => {
    if (!window.confirm(`Delete “${item.name || item.title || item.code}”? This action cannot be undone.`)) return
    const kind = item.bannerImageUrl || item.desktopImageUrl ? 'banner' : item.code ? 'coupon' : 'promotion'
    try {
      if (kind === 'banner') await deleteAdminBanner(item.id, token)
      else if (kind === 'coupon') await deleteAdminCoupon(item.id, token)
      else await deleteAdminPromotion(item.id, token)
      setNotice('Record deleted.')
      await load()
    } catch (requestError) { setError(requestError.message || 'Record could not be deleted.') }
  }

  const listTitle = tab === 'banners' ? 'Homepage banners' : tab === 'coupons' ? 'Coupon codes' : tab === 'expired' ? 'Expired offers' : tab === 'scheduled' ? 'Scheduled offers' : 'Promotion campaigns'

  return <AdminLayout title="Promotions & Coupons" description="Create campaigns, manage coupon codes, and promote offers across Dorkar services.">
    <div className="promotions-page">
      {error && <div className="promo-alert" role="alert"><AdminIcon name="help" size={18}/><p>{error}</p><button type="button" onClick={() => load()}>Try again</button></div>}
      {notice && <div className="promo-notice" role="status"><span>✓</span>{notice}<button type="button" onClick={() => setNotice('')} aria-label="Dismiss message">×</button></div>}

      <section className="promo-stats" aria-label="Promotion summary">
        <Stat icon="tag" label="Active Promotions" value={summary?.activePromotions} note="Published campaigns" tone="red"/>
        <Stat icon="card" label="Active Coupons" value={summary?.activeCoupons} note="Currently usable codes" tone="blue"/>
        <Stat icon="users" label="Total Redemptions" value={summary?.totalRedemptions} note="Recorded successful uses" tone="purple"/>
        <Stat icon="chart" label="Discount Given" value={summary?.discountGiven == null ? '—' : money(summary.discountGiven)} note="Recorded discounts" tone="green"/>
      </section>

      <section className="promo-workspace">
        <div className="promo-tabs" role="tablist" aria-label="Promotion categories">{tabs.map(item => <button key={item.id} className={tab === item.id ? 'active' : ''} type="button" role="tab" aria-selected={tab === item.id} onClick={() => selectTab(item.id)}>{item.label}{tab === item.id && <span>{visibleRecords.length}</span>}</button>)}
          <div className="promo-actions"><button className="promo-button secondary" type="button" onClick={() => startCreate('coupon')}><AdminIcon name="tag" size={16}/>Create Coupon</button><button className="promo-button primary" type="button" onClick={() => startCreate()}><span aria-hidden="true">＋</span>Create {tab === 'banners' ? 'Banner' : tab === 'coupons' ? 'Coupon' : 'Promotion'}</button></div>
        </div>
        <div className="promo-list-header"><div><h2>{listTitle}</h2><p>Manage campaign content, timing, and publishing status.</p></div><button className="promo-refresh" type="button" onClick={() => load()} disabled={loading}><AdminIcon name="settings" size={16}/>Refresh</button></div>
        <div className="promo-filters"><label className="promo-search"><AdminIcon name="search" size={17}/><input value={query} onChange={event => { setQuery(event.target.value); setPage(1) }} placeholder="Search by title, code, or service…" aria-label="Search promotions"/><button hidden={!query} type="button" onClick={() => setQuery('')} aria-label="Clear search">×</button></label><label><span className="sr-only">Filter service</span><select value={serviceFilter} onChange={event => { setServiceFilter(event.target.value); setPage(1) }}><option value="ALL">All services</option><option value="RIDE">Ride</option><option value="FOOD">Food</option><option value="PARCEL">Parcel</option><option value="BLOOD">Blood donation</option></select><AdminIcon name="chevron" size={15}/></label><label><span className="sr-only">Filter status</span><select value={statusFilter} onChange={event => { setStatusFilter(event.target.value); setPage(1) }}><option value="ALL">All statuses</option>{['DRAFT','SCHEDULED','ACTIVE','PAUSED','INACTIVE','EXPIRED'].map(value => <option key={value} value={value}>{titleCase(value)}</option>)}</select><AdminIcon name="chevron" size={15}/></label><button className="promo-reset" type="button" onClick={() => { setQuery(''); setStatusFilter('ALL'); setServiceFilter('ALL'); setPage(1) }}>Reset filters</button></div>

        <div className="promo-table-wrap"><table className="promo-table"><thead><tr><th>Promotion / Coupon</th><th>Type</th><th>Service</th><th>Offer</th><th>Validity</th><th>Usage</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          {loading && <tr><td colSpan="8"><div className="promo-empty"><span className="promo-spinner"/><b>Loading promotion records…</b></div></td></tr>}
          {!loading && pageRows.map(item => {
            const isBanner = Boolean(item.bannerImageUrl || item.desktopImageUrl)
            const isCoupon = Boolean(item.code)
            const name = item.name || item.title || item.code || `Record ${item.id}`
            const discount = item.discountType === 'PERCENTAGE' ? `${item.discountValue}%` : item.discountType === 'FIXED' ? money(item.discountValue) : 'Special offer'
            const useCount = item.redemptionCount ?? item.usageCount
            const limit = item.totalUsageLimit
            return <tr key={`${isBanner ? 'banner' : isCoupon ? 'coupon' : 'promotion'}-${item.id}`}>
              <td><div className="promo-identity">{isBanner ? <img src={item.bannerImageUrl || item.desktopImageUrl} alt=""/> : <span className={`promo-record-icon ${isCoupon ? 'coupon' : ''}`}><AdminIcon name={isCoupon ? 'tag' : 'chart'} size={17}/></span>}<span><b>{isCoupon ? item.code : name}</b><small>{isCoupon ? item.name : item.description || (isBanner ? 'Homepage carousel banner' : 'Promotion campaign')}</small></span></div></td>
              <td><span className={`promo-type ${isCoupon ? 'coupon' : isBanner ? 'banner' : ''}`}>{isCoupon ? 'Coupon' : isBanner ? 'Banner' : titleCase(item.discountType || 'Campaign')}</span></td>
              <td>{serviceLabel(item.serviceType)}</td><td className="promo-discount">{discount}</td>
              <td><span className="promo-dates">{shortDate(item.startAt)} – {shortDate(item.endAt)}</span></td>
              <td>{useCount == null ? <span className="promo-unavailable">Not tracked</span> : `${Number(useCount).toLocaleString('en-BD')}${limit ? ` / ${Number(limit).toLocaleString('en-BD')}` : ''}`}</td>
              <td><Status value={effectiveStatus(item)}/></td>
              <td><div className="promo-row-actions"><button type="button" onClick={() => startCreate(isBanner ? 'banner' : isCoupon ? 'coupon' : 'promotion', { ...item })} aria-label={`Edit ${name}`} title="Edit"><AdminIcon name="settings" size={16}/></button><button type="button" onClick={() => startCreate(isBanner ? 'banner' : isCoupon ? 'coupon' : 'promotion', { ...item }, true)} aria-label={`Duplicate ${name}`} title="Duplicate">⧉</button><button type="button" disabled={effectiveStatus(item) === 'EXPIRED'} onClick={() => changeStatus(item)} aria-label={`${effectiveStatus(item) === 'ACTIVE' ? 'Pause' : 'Activate'} ${name}`} title={effectiveStatus(item) === 'ACTIVE' ? 'Pause' : effectiveStatus(item) === 'EXPIRED' ? 'Expired' : 'Activate'}><AdminIcon name={effectiveStatus(item) === 'ACTIVE' ? 'close' : 'shield'} size={16}/></button><button className="danger" type="button" onClick={() => removeRecord(item)} aria-label={`Delete ${name}`} title="Delete">×</button></div></td>
            </tr>
          })}
          {!loading && pageRows.length === 0 && <tr><td colSpan="8"><div className="promo-empty"><span><AdminIcon name={tab === 'banners' ? 'tag' : 'chart'} size={24}/></span><b>{error ? 'Promotion data is unavailable' : `No ${tab === 'expired' || tab === 'scheduled' ? tab : listTitle.toLowerCase()} yet`}</b><p>{error ? 'Check the backend connection and try again.' : 'Create a record to start publishing real offers. No sample campaigns are shown.'}</p>{!error && <button className="promo-button primary" type="button" onClick={() => startCreate()}>Create {tab === 'banners' ? 'Banner' : tab === 'coupons' ? 'Coupon' : 'Promotion'}</button>}</div></td></tr>}
        </tbody></table></div>
        <div className="promo-pagination"><span>{visibleRecords.length ? `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, visibleRecords.length)} of ${visibleRecords.length} records` : loading ? 'Loading records…' : 'Showing 0 records'}</span><div><button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage(value => Math.max(1, value - 1))}>Previous</button><span>Page {page} of {totalPages}</span><button type="button" aria-label="Next page" disabled={page >= totalPages} onClick={() => setPage(value => Math.min(totalPages, value + 1))}>Next</button></div></div>
      </section>
    </div>

    {editor && <div className="promo-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !saving) { setEditor(null); setImagePreview('') } }}><section className="promo-modal" role="dialog" aria-modal="true" aria-labelledby="promo-modal-title"><button className="promo-modal-close" type="button" onClick={() => { setEditor(null); setImagePreview('') }} aria-label="Close form">×</button><span className="promo-modal-kicker">DORKAR CAMPAIGNS</span><h2 id="promo-modal-title">{editor.source && !editor.duplicate ? 'Edit' : editor.duplicate ? 'Duplicate' : 'Create'} {editor.kind === 'banner' ? 'homepage banner' : editor.kind}</h2><p>Set offer rules and publication dates. Validation is enforced by the backend.</p>
      <form className="promo-form" onSubmit={saveRecord}>
        <label className="full">{editor.kind === 'banner' ? 'Internal banner title' : editor.kind === 'coupon' ? 'Coupon name' : 'Campaign name'}<input name="name" defaultValue={editor.source?.name || editor.source?.title || ''} maxLength="140" required placeholder="For admin reference"/></label>
        {editor.kind === 'coupon' && <label>Coupon code<input name="code" defaultValue={editor.duplicate ? '' : editor.source?.code || ''} required maxLength="32" pattern="[A-Za-z0-9_-]+" placeholder="RIDE20"/></label>}
        {editor.kind !== 'banner' ? <>
          <label>Discount type<select name="discountType" defaultValue={editor.source?.discountType || 'PERCENTAGE'}><option value="PERCENTAGE">Percentage</option><option value="FIXED">Fixed BDT</option>{editor.kind === 'promotion' && <option value="SPECIAL">Special offer</option>}</select></label>
          <label>Discount value<input name="discountValue" type="number" min="0.01" step="0.01" defaultValue={editor.source?.discountValue ?? ''} required/></label>
          <label>Minimum order (৳)<input name="minOrderAmount" type="number" min="0" step="0.01" defaultValue={editor.source?.minOrderAmount ?? ''}/></label>
          <label>Maximum discount (৳)<input name="maxDiscountAmount" type="number" min="0" step="0.01" defaultValue={editor.source?.maxDiscountAmount ?? ''}/></label>
          {editor.kind === 'promotion' && <label className="full">Description<textarea name="description" rows="2" defaultValue={editor.source?.description || ''} maxLength="500" placeholder="Short internal or customer-facing description"/></label>}
          <label>Applicable service<select name="serviceType" defaultValue={editor.source?.serviceType || 'ALL'}><option value="ALL">All services</option><option value="RIDE">Ride</option><option value="FOOD">Food</option><option value="PARCEL">Parcel</option><option value="BLOOD">Blood donation</option></select></label>
          <label>Total redemption limit<input name="totalUsageLimit" type="number" min="1" defaultValue={editor.source?.totalUsageLimit ?? ''}/></label>
          <label>Per customer limit<input name="perCustomerLimit" type="number" min="1" defaultValue={editor.source?.perCustomerLimit ?? 1}/></label>
        </> : <>
          <label>Destination type<select name="targetType" defaultValue={editor.source?.targetType || 'NONE'}><option value="NONE">No destination</option><option value="PROMOTION">Promotion details</option><option value="RESTAURANT">Restaurant</option><option value="RIDE">Ride service</option><option value="FOOD">Food service</option><option value="PARCEL">Parcel service</option><option value="BLOOD">Blood donation</option><option value="EXTERNAL">External URL</option></select></label>
          <label>Destination ID<input name="targetId" defaultValue={editor.source?.targetId || ''} placeholder="Optional internal ID"/></label>
          <label className="full">External URL<input name="targetUrl" type="url" defaultValue={editor.source?.targetUrl || ''} placeholder="https://example.com/offer"/></label>
          <label>Display order<input name="displayOrder" type="number" min="0" defaultValue={editor.source?.displayOrder ?? 0}/></label>
          <label>Slide duration<select name="durationSeconds" defaultValue={editor.source?.durationSeconds || 5}><option value="5">5 seconds</option><option value="8">8 seconds</option></select></label>
          <label className="full">Banner image (JPG, PNG, WebP · max 8 MB)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} required={!editor.source?.desktopImageUrl && !editor.source?.bannerImageUrl}/></label>
          <label className="full">Mobile banner image (optional)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleMobileImage}/></label>
          {imagePreview && <div className="promo-image-preview full"><img src={imagePreview} alt="Banner preview"/><span>Preview · display crop uses contained image sizing</span></div>}
        </>}
        <label>Start date and time<input name="startAt" type="datetime-local" defaultValue={toLocalDateTime(editor.source?.startAt)}/></label>
        <label>End date and time<input name="endAt" type="datetime-local" defaultValue={toLocalDateTime(editor.source?.endAt)}/></label>
        <label>Status<select name="status" defaultValue={editor.source?.status || 'DRAFT'}><option value="DRAFT">Draft</option><option value="SCHEDULED">Scheduled</option><option value="ACTIVE">Active</option><option value={editor.kind === 'banner' ? 'INACTIVE' : 'PAUSED'}>{editor.kind === 'banner' ? 'Inactive' : 'Paused'}</option></select></label>
        <div className="promo-form-foot full"><p>Published content follows its start/end schedule. Uploads are stored in Cloudinary.</p><button className="promo-button primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button></div>
      </form>
    </section></div>}
  </AdminLayout>
}
