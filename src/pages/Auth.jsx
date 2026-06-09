import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { signIn, signUp, saveFounderProfile } from '../lib/supabaseClient.js'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import { identifyUser } from '../lib/posthogClient.js'
import logo from '../assets/path360-logo.png'

export default function Auth() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode') === 'login' ? 'login' : 'signup'

  const setUser = useDiagnosticStore((s) => s.setUser)
  const setFounderProfile = useDiagnosticStore((s) => s.setFounderProfile)

  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    ventureName: '',
    industry: '',
    ventureStage: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
  }, [mode])

  const pageCopy = useMemo(() => {
    if (mode === 'login') {
      return {
        title: 'Welcome back',
        subtitle: 'Sign in to continue your PATH360 journey.',
        button: 'Sign in',
        switchText: "Don't have an account?",
        switchLink: '/auth?mode=signup',
        switchLabel: 'Create one',
      }
    }

    return {
      title: 'Create your account',
      subtitle: 'Join PATH360 and get a clearer view of your investor readiness.',
      button: 'Create account',
      switchText: 'Already have an account?',
      switchLink: '/auth?mode=login',
      switchLabel: 'Sign in',
    }
  }, [mode])

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'login') {
        const authData = await signIn(form.email, form.password)
        const user = authData?.user ?? authData?.session?.user ?? null

        if (!user) {
          throw new Error('Could not read user from Supabase login response.')
        }

        setUser(user)
        identifyUser?.(user.id, { email: user.email })
        navigate('/app/dashboard', { replace: true })
        return
      }

      if (!form.fullName.trim()) {
        throw new Error('Full name is required.')
      }

      if (form.password.length < 8) {
        throw new Error('Password must be at least 8 characters.')
      }

      const authData = await signUp(form.email, form.password)
      const user = authData?.user ?? authData?.session?.user ?? null

      if (!user) {
        throw new Error('Could not read user from Supabase signup response.')
      }

      setUser(user)
      identifyUser?.(user.id, {
        email: user.email,
        fullName: form.fullName,
      })

      const profile = await saveFounderProfile(user.id, {
        fullname: form.fullName,
        venturename: form.ventureName,
        industry: form.industry,
        venturestage: form.ventureStage,
      })

      setFounderProfile(profile)
      navigate('/app/assessment', { replace: true })
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F6F5F1',
        color: '#111111',
        fontFamily: '"DM Sans", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

        * { box-sizing: border-box; }
        body { margin: 0; }

        @media (max-width: 760px) {
          .auth-shell {
            grid-template-columns: 1fr !important;
            max-width: 560px !important;
          }

          .auth-brand-panel {
            padding: 28px 24px !important;
            min-height: auto !important;
          }

          .auth-form-panel {
            padding: 28px 24px !important;
          }
        }
      `}</style>

      <div
        className="auth-shell"
        style={{
          width: '100%',
          maxWidth: 1080,
          display: 'grid',
          gridTemplateColumns: '0.95fr 1.05fr',
          background: '#FCFBF8',
          border: '1px solid rgba(17,17,17,0.08)',
          borderRadius: 28,
          overflow: 'hidden',
          boxShadow: '0 28px 70px rgba(17,17,17,0.08)',
        }}
      >
        <div
          className="auth-brand-panel"
          style={{
            background: 'linear-gradient(180deg, #163A2C 0%, #1F4D3A 100%)',
            color: '#FFFFFF',
            padding: '40px 36px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: 680,
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 26,
              }}
            >
              <img
                src={logo}
                alt="Path 360-Beyond Borders"
                style={{
                  height: 64,
                  width: 'auto',
                  display: 'block',
                  objectFit: 'contain',
                  background: '#F6F5F1',
                  borderRadius: 16,
                  padding: 8,
                }}
              />

              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.78)',
                    marginBottom: 4,
                  }}
                >
                  Powered by
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Path 360-Beyond Borders
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.14)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: 18,
              }}
            >
              Founder intelligence
            </div>

            <h1
              style={{
                fontSize: 'clamp(34px, 4vw, 48px)',
                lineHeight: 1.02,
                letterSpacing: '-0.05em',
                fontWeight: 800,
                margin: '0 0 16px',
                maxWidth: 420,
              }}
            >
              A sharper, calmer path to investor readiness.
            </h1>

            <p
              style={{
                fontSize: 15.5,
                lineHeight: 1.8,
                color: 'rgba(255,255,255,0.78)',
                margin: 0,
                maxWidth: 420,
              }}
            >
              Build clarity around your venture, understand what investors may question,
              and move forward with more confidence and direction.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gap: 12,
              marginTop: 32,
            }}
          >
            {[
              'One clear founder view',
              'Investor-oriented feedback',
              'Practical next-step guidance',
            ].map((item) => (
              <div
                key={item}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: 16,
                  padding: '14px 16px',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#FFFFFF',
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div
          className="auth-form-panel"
          style={{
            padding: '40px 40px 36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#FCFBF8',
          }}
        >
          <div style={{ width: '100%', maxWidth: 420 }}>
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#4D6B57',
                  marginBottom: 8,
                }}
              >
                PATH360 Access
              </div>

              <h2
                style={{
                  fontSize: 34,
                  lineHeight: 1.05,
                  letterSpacing: '-0.04em',
                  fontWeight: 800,
                  color: '#111111',
                  margin: '0 0 10px',
                }}
              >
                {pageCopy.title}
              </h2>

              <p
                style={{
                  fontSize: 14.5,
                  lineHeight: 1.75,
                  color: '#666666',
                  margin: 0,
                }}
              >
                {pageCopy.subtitle}
              </p>
            </div>

            {error && (
              <div
                style={{
                  marginBottom: 16,
                  background: '#FDEAEA',
                  border: '1px solid rgba(139,32,32,0.18)',
                  color: '#8B2020',
                  borderRadius: 14,
                  padding: '12px 14px',
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
              {mode === 'signup' && (
                <>
                  <div>
                    <label htmlFor="fullName" style={labelStyle}>Full name</label>
                    <input
                      id="fullName"
                      type="text"
                      value={form.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      placeholder="Your full name"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label htmlFor="ventureName" style={labelStyle}>Venture name</label>
                    <input
                      id="ventureName"
                      type="text"
                      value={form.ventureName}
                      onChange={(e) => updateField('ventureName', e.target.value)}
                      placeholder="Your venture name"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label htmlFor="industry" style={labelStyle}>Industry</label>
                    <input
                      id="industry"
                      type="text"
                      value={form.industry}
                      onChange={(e) => updateField('industry', e.target.value)}
                      placeholder="e.g. FinTech, SaaS, HealthTech"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label htmlFor="ventureStage" style={labelStyle}>Current stage</label>
                    <input
                      id="ventureStage"
                      type="text"
                      value={form.ventureStage}
                      onChange={(e) => updateField('ventureStage', e.target.value)}
                      placeholder="e.g. Idea, Pre-seed, Seed"
                      style={inputStyle}
                    />
                  </div>
                </>
              )}

              <div>
                <label htmlFor="email" style={labelStyle}>Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="you@example.com"
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="password" style={labelStyle}>Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  placeholder="At least 8 characters"
                  style={inputStyle}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 6,
                  height: 54,
                  borderRadius: 14,
                  border: 'none',
                  background: '#163A2C',
                  color: '#FFFFFF',
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: loading ? 'default' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 16px 32px rgba(22,58,44,0.18)',
                }}
              >
                {loading ? 'Please wait...' : pageCopy.button}
              </button>
            </form>

            <div
              style={{
                marginTop: 18,
                fontSize: 14,
                color: '#666666',
                textAlign: 'center',
              }}
            >
              {pageCopy.switchText}{' '}
              <Link
                to={pageCopy.switchLink}
                style={{
                  color: '#163A2C',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                {pageCopy.switchLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  color: '#303030',
  marginBottom: 8,
}

const inputStyle = {
  width: '100%',
  height: 52,
  borderRadius: 14,
  border: '1px solid rgba(17,17,17,0.10)',
  background: '#F7F6F2',
  padding: '0 16px',
  fontSize: 14.5,
  color: '#111111',
  outline: 'none',
}