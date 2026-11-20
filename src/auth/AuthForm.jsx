import { useState } from 'react'
import { getPostLoginPath, saveAuthSession } from './session'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://dorker-backend.onrender.com').trim().replace(/\/$/, '')

const fieldLabels = {
  name: 'Name',
  phone: 'Phone number',
  email: 'Email address',
  password: 'Password',
}

function getResponseError(response, result, isRegister) {
  const fieldErrors = result?.data?.fields || result?.errors || result?.data?.errors
  if (fieldErrors && typeof fieldErrors === 'object') {
    const messages = Object.entries(fieldErrors)
      .map(([field, message]) => `${fieldLabels[field] || field}: ${Array.isArray(message) ? message.join(', ') : message}`)
      .filter((entry) => !entry.endsWith(': '))
    if (messages.length) return messages.join(' ')
  }

  if (response.status === 401 && result?.message?.toLowerCase() === 'authentication is required') {
    return isRegister
      ? 'Account creation is temporarily unavailable. Please try again later.'
      : 'Sign-in is temporarily unavailable. Please try again later.'
  }
  if (response.status === 401) {
    return isRegister
      ? 'We could not create your account. Please try again or contact support.'
      : 'Phone number or password is incorrect. Please check both and try again.'
  }
  if (response.status === 403) return 'This account does not have permission to continue.'
  if (response.status === 404 && !result?.message) {
    return isRegister ? 'The registration service is unavailable. Please try again later.' : 'No account was found for this phone number. Create an account to get started.'
  }
  if (response.status === 409) return 'An account already exists with this phone number or email. Try signing in instead.'
  if (response.status === 429) return 'Too many attempts. Please wait a few minutes and try again.'
  if (response.status >= 500) return 'The service is temporarily unavailable. Please try again shortly.'
  if (result?.message && result.message !== 'Request validation failed') return result.message
  if (response.status === 400) return 'Please check the information you entered and try again.'
  return `Request could not be completed (HTTP ${response.status}). Please try again.`
}

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
        throw new Error(getResponseError(response, result, isRegister))
      }

      const auth = result?.data
      if (!auth?.accessToken || !auth?.user) {
        throw new Error('The server response was incomplete. Please try again.')
      }

      saveAuthSession(auth)
      window.location.replace(getPostLoginPath(auth.user))
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
      {error && <p className="form-notice auth-error" role="alert" aria-live="polite">{error}</p>}
    </form>
  )
}
