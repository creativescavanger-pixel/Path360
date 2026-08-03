import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import { signOut } from '../lib/supabaseClient.js'
import AppLogo from './AppLogo.jsx'

const NAV_ITEMS = [
  { to: '/app/dashboard', label: 'Command Center', icon: '•' },
  { to: '/app/founder-profile', label: 'Founder Profile', icon: '•' },
  { to: '/app/studio', label: 'Creation Studio', icon: '•' },
  { to: '/app/memory', label: 'Memory', icon: '•' },
  { to: '/app/radar', label: 'Venture Radar', icon: '•' },
  { to: '/app/reports', label: 'Reports', icon: '•' },
]

const styles = {
  aside: {
    width: 268,
    minHeight: '100vh',
    background: '#F6F4EF',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #D9D4CA',
    flexShrink: 0,
    fontFamily: "'Inter', 'DM Sans', sans-serif",
  },
  brandWrap: {
    padding: '12px 14px 10px',
    borderBottom: '1px solid #D9D4CA',
    minHeight: 72,
    display: 'flex',
    alignItems: 'center',
  },
  nav: {
    padding: '18px 10px 14px',
    flex: 1,
  },
  navLabel: {
    fontSize: 10,
    color: '#9A9388',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    padding: '0 10px 14px',
    margin: 0,
    fontWeight: 700,
  },
  divider: {
    height: 1,
    background: '#DDD7CC',
    margin: '18px 8px',
  },
  assessmentLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '16px 14px',
    borderRadius: 18,
    textDecoration: 'none',
    background: '#1D6B4F',
    border: '1px solid #1D6B4F',
    color: '#FFFFFF',
    cursor: 'pointer',
    boxShadow: '0 10px 20px rgba(29,107,79,0.14)',
    transition: 'all 0.18s ease',
    width: '100%',
  },
  assessmentIcon: {
    width: 18,
    height: 18,
    borderRadius: 999,
    border: '1.5px solid rgba(255,255,255,0.75)',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    fontSize: 10,
    fontWeight: 700,
    color: '#FFFFFF',
  },
  assessmentText: {
    fontSize: 13.5,
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  feedbackButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '13px 14px',
    borderRadius: 16,
    textDecoration: 'none',
    background: '#FFFFFF',
    border: '1px solid #D9D4CA',
    color: '#1C1C1A',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    width: '100%',
    marginTop: 10,
  },
  feedbackIcon: {
    width: 18,
    height: 18,
    borderRadius: 999,
    background: '#EEF4EF',
    border: '1px solid #D6E4D7',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 700,
    color: '#1D6B4F',
  },
  feedbackTextWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 1,
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  feedbackSubtext: {
    fontSize: 11,
    color: '#6E6B65',
    lineHeight: 1.4,
  },
  footer: {
    padding: '14px 14px 18px',
    borderTop: '1px solid #D9D4CA',
  },
  accountCard: {
    background: '#EEF4EF',
    border: '1px solid #D6E4D7',
    borderRadius: 14,
    padding: '12px 12px',
  },
  tier: {
    fontSize: 10,
    color: '#2A6A51',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 5,
    fontWeight: 600,
  },
  founderName: {
    fontSize: 12.5,
    color: '#1A1A18',
    fontWeight: 600,
  },
  founderMeta: {
    fontSize: 11,
    color: '#6E6B65',
    marginTop: 3,
  },
}

function getNavItemStyle(isActive) {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 14px',
    borderRadius: 18,
    textDecoration: 'none',
    marginBottom: 6,
    background: isActive ? '#EAF1EB' : 'transparent',
    border: isActive ? '1px solid #CFE0D0' : '1px solid transparent',
    color: isActive ? '#1D6B4F' : '#6E6B65',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    fontWeight: isActive ? 600 : 500,
  }
}

const navIconStyle = {
  fontSize: 17,
  width: 18,
  textAlign: 'center',
  lineHeight: 1,
  flexShrink: 0,
  color: 'currentColor',
}

const navLabelStyle = {
  fontSize: 13.5,
  flex: 1,
  letterSpacing: '-0.01em',
}

const OVERLAY_Z_INDEX = 2147483646
const MODAL_Z_INDEX = 2147483647

function FeedbackModal({ open, onClose, pagePath, ventureName }) {
  const [feedbackType, setFeedbackType] = useState('suggestion')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      setFeedbackType('suggestion')
      setMessage('')
      setSubmitting(false)
      setSubmitted(false)
    }
  }, [open])

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!message.trim()) return

    setSubmitting(true)

    try {
      const payload = {
        feedback_type: feedbackType,
        message: message.trim(),
        page: pagePath,
        venture_name: ventureName,
        created_at: new Date().toISOString(),
      }

      console.log('Founder feedback payload:', payload)

      setSubmitted(true)
      setMessage('')
    } catch (err) {
      console.error('Feedback submission failed:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return createPortal(
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(20, 24, 22, 0.42)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          zIndex: OVERLAY_Z_INDEX,
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share feedback"
        style={{
          position: 'fixed',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          zIndex: MODAL_Z_INDEX,
          padding: 18,
          pointerEvents: 'none',
        }}
      >
        <div
          onClick={(event) => event.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 520,
            maxHeight: 'calc(100vh - 36px)',
            overflowY: 'auto',
            background: '#FFFFFF',
            borderRadius: 18,
            border: '1px solid #E2DED6',
            boxShadow: '0 24px 64px rgba(22,24,27,0.18)',
            overflow: 'hidden',
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              padding: '18px 18px 14px',
              borderBottom: '1px solid #ECE6DB',
              background: '#F8F6F1',
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: '#1D6B4F',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              Founder feedback
            </div>

            <div style={{ fontSize: 18, fontWeight: 700, color: '#1C1C1A', marginBottom: 6 }}>
              Help improve Path360
            </div>

            <div style={{ fontSize: 12.5, color: '#6B6965', lineHeight: 1.65 }}>
              Tell us what felt confusing, missing, helpful, or broken. Your current page context is attached automatically.
            </div>
          </div>

          <div style={{ padding: 18 }}>
            {submitted ? (
              <div
                style={{
                  background: '#EEF4EF',
                  border: '1px solid #D6E4D7',
                  borderRadius: 14,
                  padding: 16,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1D6B4F', marginBottom: 6 }}>
                  Thanks — feedback received
                </div>

                <div style={{ fontSize: 12.5, color: '#4D6357', lineHeight: 1.7, marginBottom: 14 }}>
                  Your note has been captured with the page context so the team can review it properly.
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '9px 12px',
                    borderRadius: 10,
                    border: '1px solid #CFE0D0',
                    background: '#FFFFFF',
                    color: '#1D6B4F',
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
                <div>
                  <label
                    htmlFor="feedback-type"
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#1C1C1A',
                      marginBottom: 6,
                    }}
                  >
                    Feedback type
                  </label>

                  <select
                    id="feedback-type"
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    style={{
                      width: '100%',
                      height: 42,
                      borderRadius: 12,
                      border: '1px solid #D9D4CA',
                      background: '#FFFFFF',
                      padding: '0 12px',
                      fontSize: 13,
                      color: '#1C1C1A',
                      outline: 'none',
                    }}
                  >
                    <option value="suggestion">Suggestion</option>
                    <option value="bug">Bug</option>
                    <option value="confusing">Confusing</option>
                    <option value="missing_feature">Missing feature</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="feedback-message"
                    style={{
                      display: 'block',
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#1C1C1A',
                      marginBottom: 6,
                    }}
                  >
                    Your message
                  </label>

                  <textarea
                    id="feedback-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What happened, what felt missing, or what should be improved?"
                    rows={6}
                    style={{
                      width: '100%',
                      borderRadius: 12,
                      border: '1px solid #D9D4CA',
                      background: '#FFFFFF',
                      padding: 12,
                      fontSize: 13,
                      color: '#1C1C1A',
                      resize: 'vertical',
                      outline: 'none',
                      fontFamily: 'inherit',
                      lineHeight: 1.6,
                    }}
                  />
                </div>

                <div
                  style={{
                    background: '#F8F6F1',
                    border: '1px solid #ECE6DB',
                    borderRadius: 12,
                    padding: 12,
                    fontSize: 12,
                    color: '#6B6965',
                    lineHeight: 1.6,
                  }}
                >
                  <div>
                    Attached page: <strong style={{ color: '#1C1C1A' }}>{pagePath || 'Unknown page'}</strong>
                  </div>
                  <div>
                    Venture: <strong style={{ color: '#1C1C1A' }}>{ventureName || 'Not available'}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid #D9D4CA',
                      background: '#FFFFFF',
                      color: '#6B6965',
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting || !message.trim()}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1px solid #1D6B4F',
                      background: submitting || !message.trim() ? '#A7B5AC' : '#1D6B4F',
                      color: '#FFFFFF',
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: submitting || !message.trim() ? 'default' : 'pointer',
                    }}
                  >
                    {submitting ? 'Sending…' : 'Submit feedback'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)

  const founderProfile = useDiagnosticStore((s) => s.founderProfile)
  const subscriptionTier = useDiagnosticStore((s) => s.subscriptionTier)
  const assessmentResults = useDiagnosticStore((s) => s.assessmentResults)
  const setAssessmentResults = useDiagnosticStore((s) => s.setAssessmentResults)
  const setQAPairs = useDiagnosticStore((s) => s.setQAPairs)

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/')
    } catch (e) {
      console.error(e)
    }
  }

  function handleAssessmentRestart() {
    setAssessmentResults(null)
    setQAPairs([])
    navigate('/app/assessment?restart=1')
  }

  const tierLabel =
    {
      trial: 'Free Trial',
      starter: 'Starter Plan',
      growth: 'Growth Plan',
      scale: 'Scale Plan',
    }[subscriptionTier] ?? 'Free Trial'

  const displayName =
    founderProfile?.venturename ||
    founderProfile?.foundername ||
    founderProfile?.fullname ||
    'Your Venture'

  const displayMeta =
    founderProfile?.industry ||
    founderProfile?.role ||
    founderProfile?.email ||
    'Profile not completed'

  const ventureName =
    founderProfile?.venturename ||
    founderProfile?.venture_name ||
    displayName

  return (
    <>
      <aside style={styles.aside}>
        <div style={styles.brandWrap}>
          <AppLogo width={188} />
        </div>

        <nav aria-label="Workspace" style={styles.nav}>
          <p style={styles.navLabel}>Workspace</p>

          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => getNavItemStyle(isActive)}
            >
              <span style={navIconStyle}>{item.icon}</span>
              <span style={navLabelStyle}>{item.label}</span>
            </NavLink>
          ))}

          <div style={styles.divider} />

          <button
            type="button"
            onClick={handleAssessmentRestart}
            style={styles.assessmentLink}
          >
            <span style={styles.assessmentIcon}>↺</span>
            <span style={styles.assessmentText}>
              {assessmentResults ? 'Re-run Assessment' : 'Begin Assessment'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsFeedbackOpen(true)}
            style={styles.feedbackButton}
          >
            <span style={styles.feedbackIcon}>✶</span>
            <div style={styles.feedbackTextWrap}>
              <span style={styles.feedbackText}>Share feedback</span>
              <span style={styles.feedbackSubtext}>Tell us what to improve</span>
            </div>
          </button>
        </nav>

        <div style={styles.footer}>
          <div style={styles.accountCard}>
            <div style={styles.tier}>{tierLabel}</div>
            <div style={styles.founderName}>{displayName}</div>
            <div style={styles.founderMeta}>{displayMeta}</div>
          </div>
        </div>
      </aside>

      <FeedbackModal
        open={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        pagePath={location.pathname}
        ventureName={ventureName}
      />
    </>
  )
}