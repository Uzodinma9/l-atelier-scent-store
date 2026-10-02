import { useEffect, useState, type FormEvent } from 'react'

type AccountModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function AccountModal({ isOpen, onClose }: AccountModalProps) {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup')
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleEmailSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatusMessage('Account services are not connected yet. Your details were not sent or saved.')
  }

  return (
    <div className="overlay-layer account-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="account-modal" role="dialog" aria-modal="true" aria-labelledby="account-title" aria-describedby="account-description">
        <button className="close-button account-close" type="button" aria-label="Close account window" onClick={onClose}>×</button>
        <p className="eyebrow">L'Atelier Scent account</p>
        <h2 id="account-title">{mode === 'signup' ? <>Make it <em>personal.</em></> : <>Welcome <em>back.</em></>}</h2>
        <p className="account-copy" id="account-description">{mode === 'signup' ? 'Create an account to keep your favourite fragrances close.' : 'Sign in to return to your saved fragrances and account.'}</p>
        <div className="account-mode-switch" role="tablist" aria-label="Choose sign up or sign in">
          <button type="button" role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? 'is-active' : ''} onClick={() => { setMode('signup'); setStatusMessage('') }}>Sign up</button>
          <button type="button" role="tab" aria-selected={mode === 'signin'} className={mode === 'signin' ? 'is-active' : ''} onClick={() => { setMode('signin'); setStatusMessage('') }}>Sign in</button>
        </div>
        <button className="google-button" type="button" onClick={() => setStatusMessage('Google authentication is not connected yet. No account was created or accessed.')}>
          <svg className="google-mark" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.653 32.657 29.223 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z" />
            <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4c-7.682 0-14.344 4.326-17.694 10.691z" />
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.197l-6.19-5.238C29.143 35.249 26.701 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.088 5.565l6.19 5.238C41.444 35.209 44 29.977 44 24c0-1.341-.138-2.651-.389-3.917z" />
          </svg>
          {mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
        </button>
        <div className="account-divider"><span />or<span /></div>
        <form className="account-form" onSubmit={handleEmailSubmit}>
          {mode === 'signup' && <label className="email-field">Your name<input type="text" name="name" autoComplete="name" placeholder="Full name" required /></label>}
          <label className="email-field">Email address<input type="email" name="email" autoComplete="email" placeholder="you@example.com" required /></label>
          <label className="email-field">Password<input type="password" name="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} placeholder={mode === 'signup' ? 'Create a password' : 'Your password'} minLength={8} required /></label>
          <button className="button button-dark email-button" type="submit">{mode === 'signup' ? 'Create account' : 'Sign in'} <span aria-hidden="true">→</span></button>
        </form>
        <p className="auth-note" aria-live="polite">{statusMessage || 'Authentication is not connected. Details are not sent or saved.'}</p>
      </section>
    </div>
  )
}