import { useState } from 'react'
import { getPostLoginPath, readAuthSession, saveAuthSession, signOut } from '../auth/session'
import { changeMyPassword } from '../services/profileApi'
import './ChangePasswordPage.css'

export default function ChangePasswordPage() {
  const session = readAuthSession()
  const [values, setValues] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const update = event => setValues(current => ({ ...current, [event.target.name]: event.target.value }))
  const submit = async event => {
    event.preventDefault()
    setError('')
    if (values.newPassword.length < 8) {
      setError('Your new password must have at least 8 characters.')
      return
    }
    if (values.newPassword !== values.confirmPassword) {
      setError('The new passwords do not match.')
      return
    }
    setSaving(true)
    try {
      const auth = await changeMyPassword(values.currentPassword, values.newPassword, session?.accessToken)
      if (!auth?.accessToken || !auth?.user || auth.user.mustChangePassword) {
        throw new Error('Your password was not updated. Please sign in again or contact support.')
      }
      saveAuthSession(auth)
      window.location.replace(getPostLoginPath(auth.user))
    } catch (requestError) {
      setError(requestError.message || 'Password could not be updated. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="change-password-page">
      <section className="change-password-card" aria-labelledby="change-password-title">
        <div className="change-password-topline"><a className="change-password-brand" href="/" aria-label="Dorkar home"><img src="/D-Logo.png" alt="Dorkar"/></a><button className="change-password-signout" type="button" onClick={signOut}>Sign out</button></div>
        <span className="change-password-kicker">SECURE YOUR ACCOUNT</span>
        <h1 id="change-password-title">Create a new password</h1>
        <p>Your administrator provided a temporary password. Change it now before continuing to your partner workspace.</p>
        <form onSubmit={submit}>
          <label>Temporary password<input name="currentPassword" type="password" value={values.currentPassword} onChange={update} autoComplete="current-password" required maxLength={72}/></label>
          <label>New password<input name="newPassword" type="password" value={values.newPassword} onChange={update} autoComplete="new-password" required minLength={8} maxLength={72}/><small>Use at least 8 characters.</small></label>
          <label>Confirm new password<input name="confirmPassword" type="password" value={values.confirmPassword} onChange={update} autoComplete="new-password" required minLength={8} maxLength={72}/></label>
          {error && <p className="change-password-error" role="alert">{error}</p>}
          <button type="submit" disabled={saving}>{saving ? 'Updating password…' : 'Save new password'}</button>
        </form>
      </section>
    </main>
  )
}
