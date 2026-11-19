import { useState } from 'react'
import { getPostLoginPath, saveAuthSession } from './session'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081,https://dorker-backend.onrender.com').replace(/\/$/, '')

export default function AuthForm({ path }) {
  const isRegister = path === '/register'
  const [values, setValues] = useState({ name: '', phone: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const update = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const endpoint = isRegister ? 'register' : 'login'
      const payload = isRegister
        ? { name: values.name.trim(), phone: values.phone.trim(), email: values.email.trim(), password: values.password }
        : { phone: values.phone.trim(), password: values.password }
      const response = await fetch(API_BASE_URL + '/api/v1/auth/' + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json().catch(() => null)

      if (!response.ok || result?.success === false) {
        throw new Error(
          result?.message ||
          result?.error ||
          'Request failed (HTTP ' + response.status + '). Please try again or check the backend response.',
        )
      }

      const auth = result?.data
      if (!auth?.accessToken || !auth?.user) {
        throw new Error('The server response was incomplete. Please try again.')
      }

      saveAuthSession(auth)
      window.location.replace(getPostLoginPath())
    } catch (requestError) {
      setError(requestError instanceof TypeError
        ? 'Could not connect to Dorkar. Make sure the backend is running, then try again.'
        : requestError.message || 'Sign in failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="form-card auth-api-form" onSubmit={submit}>
      <div className="fields-grid">
        {isRegister && <label className="form-field">
          <span>Full name</span>
          <input name="name" value={values.name} onChange={update} placeholder="Your name" autoComplete="name" required maxLength={120}/>
        </label>}
        <label className="form-field">
          <span>Phone number</span>
          <input name="phone" value={values.phone} onChange={update} placeholder="01XXXXXXXXX" type="tel" inputMode="tel" autoComplete="tel" required/>
        </label>
        {isRegister && <label className="form-field">
          <span>Email address <small>(optional)</small></span>
          <input name="email" value={values.email} onChange={update} placeholder="you@example.com" type="email" autoComplete="email" maxLength={190}/>
        </label>}
        <label className="form-field">
          <span>Password</span>
          <input name="password" value={values.password} onChange={update} placeholder="At least 8 characters" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} required minLength={isRegister ? 8 : undefined} maxLength={72}/>
        </label>
      </div>
      <button className="button primary" type="submit" disabled={submitting}>
        {submitting ? 'Please wait…' : isRegister ? 'Create account →' : 'Sign in →'}
      </button>
      {error && <p className="form-notice auth-error" role="alert">{error}</p>}
    </form>
  )
}
