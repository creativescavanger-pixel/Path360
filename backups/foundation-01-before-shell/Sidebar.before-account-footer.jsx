import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import supabase from '../lib/supabaseClient.js'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import AppLogo from './AppLogo.jsx'

const FEEDBACK_PAGES = [
  {
    path: '/app/dashboard',
    label: 'Home',
    prompt:
      'What would make the Home workspace more useful or easier to understand?',
  },
  {
    path: '/app/priority-progress',
    label: 'Current Priorities',
    prompt:
      'What would make it easier to turn your priorities into action and evidence?',
  },
  {
    path: '/app/founder-profile',
    label: 'Venture Profile',
    prompt:
      'What was unclear or difficult while completing your venture profile?',
  },
  {
    path: '/app/venture-intelligence-setup',
    label: 'Venture Setup',
    prompt:
      'What would make setting up your venture context easier or clearer?',
  },
  {
    path: '/app/venture-intelligence',
    label: 'Venture Intelligence',
    prompt:
      'What would make your market, model, operating context, or recommendations easier to use?',
  },
  {
    path: '/app/memory',
    label: 'Decisions & Insights',
    prompt:
      'What would make it easier to capture or use your decisions and insights?',
  },
  {
    path: '/app/environment',
    label: 'Explore your environment',
    prompt:
      'What country, ecosystem, legal, or market information would be most useful here?',
  },
  {
    path: '/app/studio',
    label: 'Creation Studio',
    prompt: 'What made creating an output easy or difficult?',
  },
  {
    path: '/app/reports',
    label: 'Reports',
    prompt: 'What would make reviewing or exporting reports easier?',
  },
  {
    path: '/app/academy',
    label: 'Academy',
    prompt: 'What would improve this founder-workshop experience?',
  },
  {
    path: '/app/resources',
    label: 'Knowledge Library',
    prompt:
      'What resource, tool, case, or source would make it easier to move your venture forward?',
  },
  {
    path: '/app/assessment',
    label: 'Founder Diagnostic',
    prompt:
      'What was unclear or difficult while completing your founder diagnostic?',
  },
  {
    path: '/app/stage-onboarding',
    label: 'Founder Pathway',
    prompt:
      'What would make choosing or reviewing your founder pathway easier?',
  },
  {
    path: 'other',
    label: 'Something else',
    prompt:
      'Tell us what you were trying to do and where you experienced the issue.',
  },
]

const OVERLAY_Z_INDEX = 2147483646
const MODAL_Z_INDEX = 2147483647

function getFeedbackPage(pagePath) {
  return (
    FEEDBACK_PAGES.find((page) => page.path === pagePath) ||
    FEEDBACK_PAGES[FEEDBACK_PAGES.length - 1]
  )
}

function FeedbackModal({
  open,
  onClose,
  pagePath,
  ventureName,
  founderId,
}) {
  const initialPage = useMemo(() => getFeedbackPage(pagePath), [pagePath])
  const [selectedPagePath, setSelectedPagePath] = useState(initialPage.path)
  const [feedbackType, setFeedbackType] = useState('suggestion')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const selectedPage =
    FEEDBACK_PAGES.find((page) => page.path === selectedPagePath) ||
    initialPage

  useEffect(() => {
    if (!open) return

    setSelectedPagePath(initialPage.path)

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
  }, [open, onClose, initialPage.path])

  useEffect(() => {
    if (open) return

    setFeedbackType('suggestion')
    setMessage('')
    setSubmitting(false)
    setSubmitted(false)
    setError('')
  }, [open])

  if (!open) return null

  async function handleSubmit(event) {
    event.preventDefault()

    if (!message.trim() || submitting) return

    setSubmitting(true)
    setError('')

    const payload = {
      founder_id: founderId || null,
      feedback_type: feedbackType,
      message: message.trim(),
      page: selectedPage.path === 'other' ? null : selectedPage.path,
      page_label: selectedPage.label,
      venture_name: ventureName || null,
      created_at: new Date().toISOString(),
    }

    try {
      const { error: insertError } = await supabase
        .from('founder_feedback')
        .insert(payload)

      if (insertError) throw insertError

      setSubmitted(true)
      setMessage('')
    } catch (submitError) {
      console.error('Feedback submission failed:', submitError)
      setError('We could not send your feedback right now. Please try again.')
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
          zIndex: OVERLAY_Z_INDEX,
          background: 'rgba(17, 17, 15, 0.42)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-modal-title"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: MODAL_Z_INDEX,
          display: 'grid',
          placeItems: 'center',
          padding: 18,
          pointerEvents: 'none',
        }}
      >
        <div
          onClick={(event) => event.stopPropagation()}
          className="p360-panel"
          style={{
            width: '100%',
            maxWidth: 520,
            maxHeight: 'calc(100vh - 36px)',
            overflowY: 'auto',
            pointerEvents: 'auto',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div
            style={{
              padding: '18px 18px 14px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--surface-soft)',
            }}
          >
            <div className="p360-kicker" style={{ marginBottom: 6 }}>
              Founder feedback
            </div>

            <div
              id="feedback-modal-title"
              style={{
                color: 'var(--text)',
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: '-0.025em',
                marginBottom: 6,
              }}
            >
              Help improve PATH360
            </div>

            <p
              className="p360-body-sm"
              style={{ margin: 0, fontSize: 12.5 }}
            >
              Tell us what felt confusing, missing, helpful, or broken.
            </p>
          </div>

          <div style={{ padding: 18 }}>
            {submitted ? (
              <div
                style={{
                  padding: 16,
                  border: '1px solid rgba(28, 91, 66, 0.2)',
                  borderRadius: 14,
                  background: 'var(--green-050)',
                }}
              >
                <div
                  style={{
                    color: 'var(--green-800)',
                    fontSize: 14,
                    fontWeight: 800,
                    marginBottom: 6,
                  }}
                >
                  Thanks — feedback received
                </div>

                <p
                  className="p360-body-sm"
                  style={{ margin: '0 0 14px', fontSize: 12.5 }}
                >
                  Your note has been saved with the selected page context so it
                  can be reviewed in the right place.
                </p>

                <button
                  type="button"
                  onClick={onClose}
                  className="p360-btn-secondary"
                  style={{
                    minHeight: 36,
                    padding: '0 12px',
                    fontSize: 12,
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                style={{ display: 'grid', gap: 14 }}
              >
                <div
                  style={{
                    padding: 14,
                    border: '1px solid rgba(28, 91, 66, 0.2)',
                    borderRadius: 14,
                    background: 'var(--green-050)',
                  }}
                >
                  <div className="p360-kicker" style={{ marginBottom: 5 }}>
                    You are sharing feedback about
                  </div>

                  <div
                    style={{
                      color: 'var(--text)',
                      fontSize: 16,
                      fontWeight: 800,
                      letterSpacing: '-0.02em',
                      marginBottom: 11,
                    }}
                  >
                    {selectedPage.label}
                  </div>

                  <label
                    htmlFor="feedback-page"
                    style={{
                      display: 'block',
                      color: 'var(--text)',
                      fontSize: 12,
                      fontWeight: 700,
                      marginBottom: 6,
                    }}
                  >
                    Change feedback page
                  </label>

                  <select
                    id="feedback-page"
                    value={selectedPagePath}
                    onChange={(event) =>
                      setSelectedPagePath(event.target.value)
                    }
                    className="p360-select"
                    style={{ height: 42 }}
                  >
                    {FEEDBACK_PAGES.map((page) => (
                      <option key={page.path} value={page.path}>
                        {page.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="feedback-type"
                    style={{
                      display: 'block',
                      color: 'var(--text)',
                      fontSize: 12,
                      fontWeight: 700,
                      marginBottom: 6,
                    }}
                  >
                    Feedback type
                  </label>

                  <select
                    id="feedback-type"
                    value={feedbackType}
                    onChange={(event) => setFeedbackType(event.target.value)}
                    className="p360-select"
                    style={{ height: 42 }}
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
                      color: 'var(--text)',
                      fontSize: 12,
                      fontWeight: 700,
                      marginBottom: 6,
                    }}
                  >
                    Your message
                  </label>

                  <textarea
                    id="feedback-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder={selectedPage.prompt}
                    rows={6}
                    className="p360-textarea"
                    style={{
                      minHeight: 150,
                      padding: 12,
                      lineHeight: 1.6,
                    }}
                  />
                </div>

                {ventureName ? (
                  <div
                    className="p360-card-soft"
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      color: 'var(--text-soft)',
                      fontSize: 12,
                      lineHeight: 1.6,
                    }}
                  >
                    Venture:{' '}
                    <strong style={{ color: 'var(--text)' }}>
                      {ventureName}
                    </strong>
                  </div>
                ) : null}

                {error ? (
                  <div
                    style={{
                      padding: 12,
                      border: '1px solid rgba(139, 32, 32, 0.22)',
                      borderRadius: 12,
                      background: 'var(--danger-bg)',
                      color: 'var(--danger)',
                      fontSize: 12.5,
                      lineHeight: 1.5,
                    }}
                  >
                    {error}
                  </div>
                ) : null}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 10,
                    flexWrap: 'wrap',
                  }}
                >
                  <button
                    type="button"
                    onClick={onClose}
                    className="p360-btn-secondary"
                    style={{
                      minHeight: 40,
                      padding: '0 13px',
                      fontSize: 12.5,
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting || !message.trim()}
                    className="p360-btn-primary"
                    style={{
                      minHeight: 40,
                      padding: '0 14px',
                      fontSize: 12.5,
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
    document.body,
  )
}

function NavItem({ item, isLocked, isPreview, onClick }) {
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'p360-sidebar-link',
          isActive ? 'active' : '',
          isLocked ? 'is-locked' : '',
          isPreview ? 'is-preview' : '',
        ]
          .filter(Boolean)
          .join(' ')
      }
      style={
        isLocked
          ? {
              opacity: 0.72,
              background: 'var(--surface-soft)',
              borderColor: 'var(--border)',
            }
          : undefined
      }
    >
      <span
        aria-hidden="true"
        style={{
          width: 14,
          color: isLocked ? 'var(--text-faint)' : 'currentColor',
          fontSize: 14,
          lineHeight: 1,
          textAlign: 'center',
        }}
      >
        {item.icon}
      </span>

      <span style={{ flex: 1, minWidth: 0 }}>{item.label}</span>

      {isLocked ? (
        <span className="p360-sidebar-badge">Set up first</span>
      ) : null}

      {!isLocked && isPreview ? (
        <span className="p360-sidebar-badge">Preview</span>
      ) : null}
    </NavLink>
  )
}

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)

  const user = useDiagnosticStore((state) => state.user)
  const founderProfile = useDiagnosticStore((state) => state.founderProfile)
  const subscriptionTier = useDiagnosticStore(
    (state) => state.subscriptionTier,
  )
  const startProgressReview = useDiagnosticStore(
    (state) => state.startProgressReview,
  )

  const hasVentureSetup = useDiagnosticStore((state) =>
    state.hasVentureSetup(),
  )

  const hasCompletedDiagnostic = useDiagnosticStore((state) =>
    state.hasCompletedDiagnostic(),
  )

  const navGroups = useMemo(
    () => [
      {
        label: 'Command Centre',
        items: [{ to: '/app/dashboard', label: 'Home', icon: '•' }],
      },
      {
        label: 'Your Venture',
        items: [
          {
            to: '/app/founder-profile',
            label: 'Venture Profile',
            icon: '•',
          },
          {
            to: hasVentureSetup
              ? '/app/venture-intelligence'
              : '/app/venture-intelligence-setup',
            label: hasVentureSetup
              ? 'Venture Intelligence'
              : 'Venture Setup',
            icon: '•',
          },
          {
            to: '/app/memory',
            label: 'Decisions & Insights',
            icon: '•',
            requiresAssessment: true,
          },
          {
            to: '/app/environment',
            label: 'Explore your environment',
            icon: '•',
            isPreview: !hasCompletedDiagnostic,
          },
        ],
      },
      {
        label: 'Your Pathway',
        items: [
          {
            to: '/app/stage-onboarding',
            label: 'Founder Pathway',
            icon: '•',
          },
          {
            to: '/app/priority-progress',
            label: 'Current Priorities',
            icon: '•',
            requiresAssessment: true,
          },
          {
            to: '/app/academy',
            label: 'Academy',
            icon: '•',
            requiresAssessment: true,
          },
        ],
      },
      {
        label: 'Knowledge & Outputs',
        items: [
          {
            to: '/app/resources',
            label: 'Knowledge Library',
            icon: '•',
            requiresAssessment: true,
          },
          {
            to: '/app/radar',
            label: 'Opportunity Radar',
            icon: '•',
            requiresAssessment: true,
          },
          {
            to: '/app/studio',
            label: 'Creation Studio',
            icon: '•',
            requiresAssessment: true,
          },
          {
            to: '/app/reports',
            label: 'Reports',
            icon: '•',
            requiresAssessment: true,
          },
        ],
      },
    ],
    [hasVentureSetup, hasCompletedDiagnostic],
  )

  const tierLabel =
    {
      trial: 'Free Trial',
      starter: 'Starter Plan',
      growth: 'Growth Plan',
      scale: 'Scale Plan',
    }[subscriptionTier] ?? 'Free Trial'

  const displayName =
    founderProfile?.venturename ||
    founderProfile?.venture_name ||
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

  function handlePrimaryAction() {
    if (!hasVentureSetup) {
      navigate('/app/venture-intelligence-setup')
      return
    }

    if (!hasCompletedDiagnostic) {
      navigate('/app/assessment')
      return
    }

    try {
      if (typeof startProgressReview !== 'function') {
        throw new Error('startProgressReview not available')
      }

      startProgressReview()
      navigate('/app/assessment?review=1')
    } catch (error) {
      console.error('Could not start progress review:', error)
      navigate('/app/assessment')
    }
  }

  function handleLockedItemClick(event) {
    event.preventDefault()

    if (!hasVentureSetup) {
      navigate('/app/venture-intelligence-setup')
      return
    }

    navigate('/app/assessment')
  }

  function handleEnvironmentClick(event) {
    if (hasCompletedDiagnostic) return

    event.preventDefault()

    if (!hasVentureSetup) {
      navigate('/app/venture-intelligence-setup')
      return
    }

    navigate('/app/assessment')
  }

  function getPrimaryActionCopy() {
    if (!hasVentureSetup) {
      return {
        title: 'Set up your venture',
        subtitle: 'Add your market and operating context',
        icon: '✦',
        isComplete: false,
      }
    }

    if (!hasCompletedDiagnostic) {
      return {
        title: 'Start founder diagnostic',
        subtitle: 'Clarify evidence, readiness, and priorities',
        icon: '✦',
        isComplete: false,
      }
    }

    return {
      title: 'Review progress',
      subtitle: 'Update your diagnostic when evidence changes',
      icon: '↺',
      isComplete: true,
    }
  }

  const primaryAction = getPrimaryActionCopy()

  return (
    <>
      <div className="p360-sidebar">
        <div className="p360-sidebar-brand">
          <AppLogo width={182} />
        </div>

        <nav
          aria-label="Workspace"
          className="p360-sidebar-scroll"
          style={{ flex: 1 }}
        >
          {navGroups.map((group, groupIndex) => (
            <section
              key={group.label}
              style={{ marginTop: groupIndex === 0 ? 0 : 18 }}
            >
              <div
                className="p360-label"
                style={{
                  padding: '0 10px 7px',
                  margin: 0,
                }}
              >
                {group.label}
              </div>

              <div className="p360-sidebar-nav">
                {group.items.map((item) => {
                  const isLocked = Boolean(
                    item.requiresAssessment && !hasCompletedDiagnostic,
                  )

                  const isPreview = Boolean(item.isPreview)

                  const onClick = isLocked
                    ? handleLockedItemClick
                    : item.to === '/app/environment'
                      ? handleEnvironmentClick
                      : undefined

                  return (
                    <NavItem
                      key={item.to}
                      item={item}
                      isLocked={isLocked}
                      isPreview={isPreview}
                      onClick={onClick}
                    />
                  )
                })}
              </div>
            </section>
          ))}

          <div className="p360-divider" style={{ margin: '18px 0' }} />

          <button
            type="button"
            onClick={handlePrimaryAction}
            className={
              primaryAction.isComplete
                ? 'p360-btn-secondary'
                : 'p360-btn-primary'
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              minHeight: 52,
              padding: '10px 12px',
              textAlign: 'left',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 18,
                fontSize: 13,
                fontWeight: 800,
                textAlign: 'center',
              }}
            >
              {primaryAction.icon}
            </span>

            <span
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                minWidth: 0,
              }}
            >
              <span style={{ fontSize: 12.5, fontWeight: 800 }}>
                {primaryAction.title}
              </span>

              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  lineHeight: 1.35,
                  opacity: primaryAction.isComplete ? 0.76 : 0.82,
                }}
              >
                {primaryAction.subtitle}
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsFeedbackOpen(true)}
            className="p360-btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              minHeight: 46,
              marginTop: 10,
              padding: '9px 12px',
              textAlign: 'left',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                display: 'grid',
                width: 19,
                height: 19,
                placeItems: 'center',
                borderRadius: 999,
                background: 'var(--green-050)',
                color: 'var(--green-800)',
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              ✦
            </span>

            <span
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                minWidth: 0,
              }}
            >
              <span style={{ fontSize: 12.5, fontWeight: 750 }}>
                Share feedback
              </span>

              <span
                style={{
                  color: 'var(--text-faint)',
                  fontSize: 10.5,
                  fontWeight: 600,
                }}
              >
                Help improve PATH360
              </span>
            </span>
          </button>
        </nav>

        <div className="p360-sidebar-footer">
          <div className="p360-sidebar-profile">
            <div className="p360-kicker" style={{ marginBottom: 5 }}>
              {tierLabel}
            </div>

            <div
              style={{
                color: 'var(--text)',
                fontSize: 12.5,
                fontWeight: 800,
              }}
            >
              {displayName}
            </div>

            <div
              style={{
                color: 'var(--text-soft)',
                fontSize: 11,
                marginTop: 3,
              }}
            >
              {displayMeta}
            </div>
          </div>
        </div>
      </div>

      <FeedbackModal
        open={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        pagePath={location.pathname}
        ventureName={ventureName}
        founderId={user?.id}
      />
    </>
  )
}