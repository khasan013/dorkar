import { useEffect, useRef, useState } from 'react'
import { readAuthSession, saveAuthSession, signOut } from '../../auth/session'
import { isAdminRole } from '../../auth/adminRoles'
import { createSavedLocation, deleteSavedLocation, getMyProfile, getSavedLocations, updateMyProfile, updateSavedLocation, uploadMyProfilePhoto } from '../../services/profileApi'
import heroScenery from '../../assets/Hero-bg-illlustration.png'
import './ProfilePage.css'

const sessionProfile = (user = {}) => ({ name: user.name || '', phone: user.phone || '', email: user.email || '', birthday: user.dateOfBirth || '', area: user.preferredArea || '' })
const profilePhotoUrl = (user = {}) => user.avatarUrl || user.profileImageUrl || ''
const locationFromApi = (location) => ({ ...location, label: ({ HOME: 'Home', WORK: 'Work', OTHER: 'Other' })[String(location.label || '').toUpperCase()] || location.label || 'Other', isDefault: location.isDefault ?? location.default ?? false })
const areas = ['Gulshan', 'Banani', 'Dhanmondi', 'Mirpur', 'Uttara', 'Mohammadpur', 'Bashundhara', 'Badda', 'Motijheel', 'Other Dhaka Areas']

const navItems = [
  ['profile', 'Profile', '#profile-information'],
  ['settings', 'Settings', '/settings'],
  ['bookings', 'My Bookings', '/ride/history'],
  ['locations', 'Saved Locations', '#saved-locations'],
  ['payment', 'Payment Methods', '/payment'],
  ['notifications', 'Notifications', '/notifications'],
]

function ProfileIcon({ name }) {
  const paths = {
    profile: <><circle cx="12" cy="8" r="3.4"/><path d="M5 20c.7-3.2 3.1-5 7-5s6.3 1.8 7 5"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.7-1.4-2.4L7.3 15a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 2Z"/></>,
    bookings: <><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4m8-4v4M4 10h16M8 14h3m-3 3h6"/></>,
    locations: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.2"/></>,
    payment: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18m-14 5h4"/></>,
    notifications: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Zm-8 12a2 2 0 0 0 4 0"/></>,
    security: <><path d="M12 3 20 6v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6Z"/><path d="m8.5 12 2.3 2.3 4.8-5"/></>,
    logout: <><path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5m4-4 4-4-4-4m4 4H8"/></>,
    edit: <><path d="m14 5 5 5M4 20l4.2-.9L19 8.3a2.1 2.1 0 0 0-3-3L5.2 16.1Z"/></>,
    home: <><path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1Z"/></>,
    work: <><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-13 5h18m-11 0v2h4v-2"/></>,
    camera: <><path d="M4 7h3l1.5-2h7L17 7h3v12H4Z"/><circle cx="12" cy="13" r="3.2"/></>,
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.profile}</svg>
}

export default function ProfilePage({ editable = false }) {
  const session = readAuthSession()
  const token = session?.accessToken
  const isAdmin = isAdminRole(session?.user?.role)
  const visibleNavItems = isAdmin ? navItems.filter(([icon]) => icon === 'profile') : navItems
  const [profile, setProfile] = useState(() => sessionProfile(session?.user))
  const [savedProfile, setSavedProfile] = useState(() => sessionProfile(session?.user))
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileUnavailable, setProfileUnavailable] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [avatar, setAvatar] = useState(() => profilePhotoUrl(session?.user))
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoNotice, setPhotoNotice] = useState('')
  const [notice, setNotice] = useState('')
  const [showLocationForm, setShowLocationForm] = useState(false)
  const [locations, setLocations] = useState([])
  const [locationsLoading, setLocationsLoading] = useState(!isAdmin)
  const [editingLocation, setEditingLocation] = useState(null)
  const [locationDraft, setLocationDraft] = useState({ label: 'Home', address: '' })
  const [logoutOpen, setLogoutOpen] = useState(false)
  const avatarInput = useRef(null)

  useEffect(() => {
    if (!token) {
      setProfileLoading(false)
      setProfileUnavailable(true)
      setLocationsLoading(false)
      setNotice('Sign in to load your saved account details.')
      return undefined
    }
    const controller = new AbortController()
    setProfileLoading(true)
    getMyProfile(token, controller.signal).then(user => {
      if (controller.signal.aborted) return
      const current = sessionProfile(user)
      setProfile(current)
      setSavedProfile(current)
      const photoUrl = profilePhotoUrl(user)
      setAvatar(photoUrl)
      const activeSession = readAuthSession()
      if (activeSession) saveAuthSession({ ...activeSession, user: { ...activeSession.user, ...user, avatarUrl: photoUrl } })
      setProfileUnavailable(false)
    }).catch(error => {
      if (!controller.signal.aborted) {
        setProfileUnavailable(true)
        setNotice(error.message || 'Could not load your saved account details.')
      }
    }).finally(() => { if (!controller.signal.aborted) setProfileLoading(false) })

    if (!isAdmin) {
      setLocationsLoading(true)
      getSavedLocations(token, controller.signal).then(items => {
        if (!controller.signal.aborted) setLocations(Array.isArray(items) ? items.map(locationFromApi) : [])
      }).catch(error => {
        if (!controller.signal.aborted) setNotice(error.message || 'Could not load saved locations.')
      }).finally(() => { if (!controller.signal.aborted) setLocationsLoading(false) })
    }
    return () => controller.abort()
  }, [token, isAdmin])

  const initials = profile.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || 'KH'
  const setField = (event) => setProfile(current => ({ ...current, [event.target.name]: event.target.value }))

  const saveProfile = async (event) => {
    event.preventDefault()
    if (profileLoading || profileUnavailable || profileSaving) return
    const form = event.currentTarget
    if (!form.reportValidity()) return
    const phone = profile.phone.replace(/\D/g, '')
    const localPhone = phone.startsWith('880') ? `0${phone.slice(3)}` : phone.length === 10 && phone.startsWith('1') ? `0${phone}` : phone
    if (localPhone && !/^01[3-9]\d{8}$/.test(localPhone)) {
      setNotice('Enter a valid Bangladesh mobile number.')
      return
    }
    setProfileSaving(true)
    setNotice('')
    try {
      const updated = await updateMyProfile({
        name: profile.name.trim(),
        phone: fieldLocked('phone') ? profile.phone : localPhone || null,
        email: profile.email.trim() || null,
        dateOfBirth: profile.birthday || null,
        preferredArea: isAdmin ? null : profile.area || null,
      }, token)
      const current = sessionProfile(updated)
      setProfile(current)
      setSavedProfile(current)
      const activeSession = readAuthSession()
      if (activeSession) saveAuthSession({ ...activeSession, user: { ...activeSession.user, ...updated } })
      setNotice('Your account details have been saved.')
    } catch (error) {
      setNotice(error.message || 'Could not save your account details. Please try again.')
    } finally {
      setProfileSaving(false)
    }
  }

  const discardProfile = () => {
    setProfile(savedProfile)
    setNotice('Your unsaved changes were discarded.')
  }

  const chooseAvatar = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    event.target.value = ''
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPhotoNotice('Choose a JPG, PNG, or WebP image.')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setPhotoNotice('Choose an image smaller than 8 MB.')
      return
    }
    if (!session?.accessToken) {
      setPhotoNotice('Sign in to save a profile picture.')
      return
    }

    const previousAvatar = avatar
    const previewUrl = URL.createObjectURL(file)
    setAvatar(previewUrl)
    setPhotoUploading(true)
    setPhotoNotice('Uploading your profile picture…')
    try {
      const updatedUser = await uploadMyProfilePhoto(file, session.accessToken)
      const savedUrl = profilePhotoUrl(updatedUser)
      setAvatar(savedUrl)
      const currentSession = readAuthSession()
      if (currentSession) {
        saveAuthSession({ ...currentSession, user: { ...currentSession.user, ...updatedUser, avatarUrl: savedUrl } })
      }
      setPhotoNotice('Your profile picture has been saved.')
    } catch (error) {
      setAvatar(previousAvatar)
      setPhotoNotice(error.message || 'Could not save your profile picture. Please try again.')
    } finally {
      URL.revokeObjectURL(previewUrl)
      setPhotoUploading(false)
    }
  }

  const saveLocation = async (event) => {
    event.preventDefault()
    const payload = { label: locationDraft.label.toUpperCase(), address: locationDraft.address.trim(), isDefault: locations.length === 0 }
    try {
      if (editingLocation !== null) await updateSavedLocation(editingLocation, payload, token)
      else await createSavedLocation(payload, token)
      const current = await getSavedLocations(token)
      setLocations(Array.isArray(current) ? current.map(locationFromApi) : [])
      setEditingLocation(null)
      setLocationDraft({ label: 'Home', address: '' })
      setShowLocationForm(false)
      setNotice('Saved location updated.')
    } catch (error) {
      setNotice(error.message || 'Could not save the location. Please try again.')
    }
  }

  const removeLocation = async (id) => {
    try {
      await deleteSavedLocation(id, token)
      setLocations(current => current.filter(location => location.id !== id))
      setNotice('Saved location removed.')
    } catch (error) {
      setNotice(error.message || 'Could not remove the location. Please try again.')
    }
  }

  const fieldLocked = (field) => isAdmin && Boolean(String(savedProfile[field] || '').trim())

  return <main className="profile-page">
    <section className="profile-hero">
      <div><span className="eyebrow">{editable ? 'ACCOUNT SETTINGS' : 'MY PROFILE'}</span><h1>{editable ? 'Settings' : 'Your Profile'}</h1><p>{editable ? (isAdmin ? 'Update your account preferences and profile picture.' : 'Update your personal details and saved locations.') : (isAdmin ? 'View your administrator account details.' : 'View your personal information, contact details, and saved locations.')}</p></div>
      <div className="profile-hero-art" aria-hidden="true"><img src={heroScenery} alt="" /></div>
    </section>

    <div className="profile-layout">
      <aside className="profile-sidebar">
        <div className="profile-user-card">
          <div className="profile-avatar-wrap">
            {avatar ? <img className="profile-avatar" src={avatar} alt={`${profile.name} profile`}/> : <div className="profile-avatar profile-avatar-initials" aria-label={`${profile.name} initials`}>{initials}</div>}
            {editable&&<><button className="profile-avatar-edit" type="button" onClick={()=>avatarInput.current?.click()} aria-label={photoUploading?'Uploading profile picture':'Change profile photo'} disabled={photoUploading}><ProfileIcon name="camera"/></button><input ref={avatarInput} className="profile-file-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseAvatar}/></>}
          </div>
          <h2>{profile.name || 'Your name'}</h2><p>{profile.phone || 'Add your phone number'}</p>
          <span className="profile-verified"><i/> Account profile</span>
          {editable&&photoNotice&&<p className="profile-photo-status" role="status">{photoNotice}</p>}
        </div>
        <nav className="profile-nav" aria-label="Profile menu">
          <span className="profile-nav-label">ACCOUNT</span>
          {visibleNavItems.map(([icon, label, href]) => <a className={icon===(editable?'settings':'profile')?'active':''} href={href} key={icon}><ProfileIcon name={icon}/><span>{label}</span></a>)}
          {!isAdmin&&<span className="profile-nav-label profile-nav-label-secondary">PREFERENCES</span>}
          <button className="profile-logout-link" type="button" onClick={()=>setLogoutOpen(true)}><ProfileIcon name="logout"/><span>Log Out</span></button>
        </nav>
      </aside>

      <div className="profile-main-column">
        {profileLoading&&<p className="profile-data-alert" role="status">Loading saved account details…</p>}
        {profileUnavailable&&<p className="profile-data-alert is-error" role="alert">{notice || 'Your account details could not be loaded. Try refreshing the page.'}</p>}
        <section className="profile-panel" id="profile-information">
          <div className="profile-panel-heading"><span><ProfileIcon name="profile"/></span><div><h2>Personal Information</h2><p>{editable ? (isAdmin ? 'Your saved identity details are protected.' : 'Edit your contact details and account information.') : 'Your saved account details.'}</p></div>{!editable&&<a className="profile-add-button" href="/settings"><ProfileIcon name="edit"/><span>Edit details</span></a>}</div>
          {editable ? <form className="profile-form" onSubmit={saveProfile}>
            <label className="profile-field"><span>Full name {fieldLocked('name')&&<small className="profile-locked-label">Saved</small>}</span><input name="name" value={profile.name} onChange={setField} placeholder="Your name" autoComplete="name" required disabled={profileLoading||profileUnavailable||fieldLocked('name')}/></label>
            <label className="profile-field"><span>Phone number {fieldLocked('phone')&&<small className="profile-locked-label">Saved</small>}</span><input name="phone" value={profile.phone} onChange={setField} placeholder="01XXXXXXXXX" type="tel" inputMode="tel" autoComplete="tel" disabled={profileLoading||profileUnavailable||fieldLocked('phone')}/></label>
            <label className="profile-field"><span>Email address {fieldLocked('email')&&<small className="profile-locked-label">Saved</small>}</span><input name="email" value={profile.email} onChange={setField} placeholder="you@example.com" type="email" autoComplete="email" disabled={profileLoading||profileUnavailable||fieldLocked('email')}/></label>
            <label className="profile-field"><span>Date of birth</span><input name="birthday" value={profile.birthday} onChange={setField} type="date" disabled={profileLoading||profileUnavailable}/></label>
            {!isAdmin&&<label className="profile-field"><span>Preferred area</span><select name="area" value={profile.area} onChange={setField} disabled={profileLoading||profileUnavailable}><option value="">Select preferred area</option>{profile.area&&!areas.includes(profile.area)&&<option value={profile.area}>{profile.area}</option>}{areas.map(area=><option key={area}>{area}</option>)}</select></label>}
            <div className="profile-form-actions"><p>{isAdmin?'Your name, phone, and email are locked once saved in your account.':'Update your details to keep bookings and account notices accurate.'}</p><button className="button primary" type="submit" disabled={profileLoading||profileUnavailable||profileSaving}><span aria-hidden="true">✓</span> {profileSaving?'Saving…':'Save Changes'}</button><button className="button outline" type="button" onClick={discardProfile} disabled={profileLoading||profileUnavailable||profileSaving}>Discard</button></div>
            {notice&&<p className="profile-notice" role="status">{notice}</p>}
          </form> : <div className="profile-details-grid">
            <div><span>Full name</span><b>{profile.name || 'Not added'}</b></div>
            <div><span>Phone number</span><b>{profile.phone || 'Not added'}</b></div>
            <div><span>Email address</span><b>{profile.email || 'Not added'}</b></div>
            <div><span>Date of birth</span><b>{profile.birthday || 'Not added'}</b></div>
            {!isAdmin&&<div><span>Preferred area</span><b>{profile.area || 'Not added'}</b></div>}
          </div>}
        </section>

        {!isAdmin&&<section className="profile-panel saved-locations-panel" id="saved-locations">
          <div className="profile-panel-heading"><span><ProfileIcon name="locations"/></span><div><h2>Saved Locations</h2><p>{editable ? 'Manage the addresses you use most.' : 'Your frequent pickup and delivery addresses.'}</p></div>{editable&&<button className="profile-add-button" type="button" onClick={()=>{setEditingLocation(null);setLocationDraft({label:'Home',address:''});setShowLocationForm(value=>!value)}}>{showLocationForm?'×':'+'}<span>{showLocationForm?'Close':'Add location'}</span></button>}</div>
          {locationsLoading&&<div className="profile-empty-state"><div><b>Loading saved locations…</b></div></div>}
          {!locationsLoading&&locations.length===0&&!showLocationForm&&<div className="profile-empty-state"><span><ProfileIcon name="home"/></span><div><b>No saved locations yet</b><p>Add your home, work, or another frequent address.</p></div></div>}
          {!locationsLoading&&locations.map(location=><div className="profile-location-row" key={location.id}><span className="profile-location-icon"><ProfileIcon name={location.label==='Work'?'work':'home'}/></span><div><b>{location.label}{location.isDefault?' · Default':''}</b><p>{location.address}</p></div>{editable&&<><button type="button" aria-label={`Edit ${location.label} location`} onClick={()=>{setEditingLocation(location.id);setLocationDraft({label:location.label,address:location.address});setShowLocationForm(true)}}><ProfileIcon name="edit"/></button><button type="button" aria-label={`Delete ${location.label} location`} onClick={()=>removeLocation(location.id)}>×</button></>}</div>)}
          {editable&&showLocationForm&&<form className="profile-location-form" onSubmit={saveLocation}><label className="profile-field"><span>Location label</span><select value={locationDraft.label} onChange={event=>setLocationDraft(current=>({...current,label:event.target.value}))}><option>Home</option><option>Work</option><option>Other</option></select></label><label className="profile-field"><span>Address</span><input value={locationDraft.address} onChange={event=>setLocationDraft(current=>({...current,address:event.target.value}))} placeholder="House, road, area, city" required/></label><button className="button primary" type="submit">{editingLocation===null?'Save location':'Update location'}</button></form>}
        </section>}

      </div>
    </div>

    {logoutOpen&&<div className="profile-modal-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)setLogoutOpen(false)}}><section className="profile-logout-modal" role="dialog" aria-modal="true" aria-labelledby="profile-logout-title"><span className="profile-logout-icon"><ProfileIcon name="logout"/></span><h2 id="profile-logout-title">Log out of Dorkar?</h2><p>You can sign back in at any time to manage your account.</p><div><button className="button outline" type="button" onClick={()=>setLogoutOpen(false)}>Stay signed in</button><button className="button primary" type="button" onClick={signOut}>Log Out</button></div></section></div>}
  </main>
}
