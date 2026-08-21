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
    prompt: 'What would improve this learning experience?',
  },
  {
    path: '/app/assessment',
    label: 'Founder Diagnostic',
    prompt:
      'What was unclear or difficult while completing your founder diagnostic?',
  },
  {
    path: '/app/stage-onboarding',
    label: 'Stage Onboarding',
    prompt: 'What would make selecting your venture stage easier?',
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

function getNavItemStyle(isActive, isLocked, isPreview) {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 11,
    width: '100%',
    padding: '10px 12px',
    borderRadius: 12,
    textDecoration: 'none',
    marginBottom: 3,
    background: isActive
      ? '#EEF4EF'
      : isLocked
        ? 'rgba(245,240,255,0.5)'
        : isPreview
          ? '#F8F6F1'
          : 'transparent',
    border: isActive
      ? '1px solid #CFE0D0'
      : isLocked
        ? '1px solid rgba(226,216,255,0.72)'
        : isPreview
          ? '1px solid #E7E1D7'
          : '1px solid transparent',
    color: isActive
      ? '#1D6B4F'
      : isLocked
        ? '#76628D'
        : isPreview
          ? '#587365'
          : '#6E6B65',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    fontWeight: isActive ? 700 : 600,
    boxSizing: 'border-box',
  }
}

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

  const fieldStyle = {
    width: '100%',
    boxSizing: 'border-box',
    borderRadius: 12,
    border: '1px solid #D9D4CA',
    background: '#FFFFFF',
    padding: '0 12px',
    fontSize: 13,
    color: '#1C1C1A',
    outline: 'none',
  }

  return createPortal(
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(20,24,22,0.42)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          zIndex: OVERLAY_Z_INDEX,
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-modal-title"
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
                color: '#7158DC',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              Founder feedback
            </div>

            <div
              id="feedback-modal-title"
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: '#1C1C1A',
                marginBottom: 6,
              }}
            >
              Help improve PATH360
            </div>

            <div
              style={{
                fontSize: 12.5,
                color: '#6B6965',
                lineHeight: 1.65,
              }}
            >
              Tell us what felt confusing, missing, helpful, or broken.
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
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: '#1D6B4F',
                    marginBottom: 6,
                  }}
                >
                  Thanks — feedback received
                </div>

                <div
                  style={{
                    fontSize: 12.5,
                    color: '#4D6357',
                    lineHeight: 1.7,
                    marginBottom: 14,
                  }}
                >
                  Your note has been saved with the page you selected, so the
                  team can review it in the right context.
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
                    fontWeight: 800,
                    cursor: 'pointer',
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
                    background: '#F5F0FF',
                    border: '1px solid #DDD1FF',
                    borderRadius: 14,
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10.5,
                      color: '#7158DC',
                      fontWeight: 800,
                      letterSpacing: '0.09em',
                      textTransform: 'uppercase',
                      marginBottom: 5,
                    }}
                  >
                    You are sharing feedback about
                  </div>

                  <div
                    style={{
                      fontSize: 17,
                      color: '#3E3850',
                      fontWeight: 800,
                      marginBottom: 11,
                    }}
                  >
                    {selectedPage.label}
                  </div>

                  <label
                    htmlFor="feedback-page"
                    style={{
                      display: 'block',
                      color: '#51486A',
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
                    style={{ ...fieldStyle, height: 42 }}
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
                    onChange={(event) => setFeedbackType(event.target.value)}
                    style={{ ...fieldStyle, height: 42 }}
                  >
                    <option value="suggestion">Suggestion</option>
                    <option value="bug">Bug</option>
                    <option value="confusing">Confusing</option>
                    <option value="missing_feature">
                      Missing feature
                    </option>
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
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder={selectedPage.prompt}
                    rows={6}
                    style={{
                      ...fieldStyle,
                      minHeight: 150,
                      padding: 12,
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      lineHeight: 1.6,
                    }}
                  />
                </div>

                {ventureName ? (
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
                    Venture:{' '}
                    <strong style={{ color: '#1C1C1A' }}>
                      {ventureName}
                    </strong>
                  </div>
                ) : null}

                {error ? (
                  <div
                    style={{
                      background: '#FBECEC',
                      border: '1px solid #E8CACA',
                      color: '#8A2F2F',
                      borderRadius: 12,
                      padding: 12,
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
                      border: '1px solid #7158DC',
                      background:
                        submitting || !message.trim()
                          ? '#B9ADC9'
                          : '#7158DC',
                      color: '#FFFFFF',
                      fontSize: 12.5,
                      fontWeight: 800,
                      cursor:
                        submitting || !message.trim()
                          ? 'default'
                          : 'pointer',
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

  const NAV_GROUPS = useMemo(
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
        ],
      },
      {
        label: 'Your Environment',
        items: [
          {
            to: '/app/environment',
            label: 'Explore your environment',
            icon: '•',
            isPreview: !hasCompletedDiagnostic,
          },
        ],
      },
      {
        label: 'Build & Move Forward',
        items: [
          {
            to: '/app/academy',
            label: 'Academy',
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
        subtitle: 'Unlock your personalised Path360 plan',
        icon: '✦',
        isComplete: false,
      }
    }

    return {
      title: 'Review progress',
      subtitle: 'Create a new version — prior work stays saved',
      icon: '↺',
      isComplete: true,
    }
  }

  const primaryAction = getPrimaryActionCopy()

  return (
    <>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#F6F4EF',
          fontFamily: "'Inter', 'DM Sans', sans-serif",
        }}
      >
        <div
          style={{
            padding: '12px 14px 10px',
            borderBottom: '1px solid #D9D4CA',
            minHeight: 72,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <AppLogo width={188} />
        </div>

        <nav
          aria-label="Workspace"
          style={{
            padding: '18px 10px 14px',
            flex: 1,
            overflowY: 'auto',
          }}
        >
          {NAV_GROUPS.map((group, groupIndex) => (
            <div
              key={group.label}
              style={{ marginTop: groupIndex === 0 ? 0 : 18 }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: '#9A9388',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  padding: '0 10px 8px',
                  fontWeight: 800,
                }}
              >
                {group.label}
              </div>

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
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClick}
                    style={({ isActive }) =>
                      getNavItemStyle(isActive, isLocked, isPreview)
                    }
                  >
                    <span
                      style={{
                        fontSize: 17,
                        width: 18,
                        textAlign: 'center',
                        lineHeight: 1,
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </span>

                    <span
                      style={{
                        fontSize: 13,
                        flex: 1,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {item.label}
                    </span>

                    {isLocked ? (
                      <span
                        style={{
                          padding: '3px 6px',
                          borderRadius: 999,
                          background: '#E9E1FF',
                          color: '#7158DC',
                          fontSize: 9.5,
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Unlock
                      </span>
                    ) : null}

                    {!isLocked && isPreview ? (
                      <span
                        style={{
                          padding: '3px 6px',
                          borderRadius: 999,
                          background: '#EAF1EB',
                          color: '#2A6A51',
                          fontSize: 9.5,
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Preview
                      </span>
                    ) : null}
                  </NavLink>
                )
              })}
            </div>
          ))}

          <div
            style={{
              height: 1,
              background: '#DDD7CC',
              margin: '18px 8px',
            }}
          />

          <button
            type="button"
            onClick={handlePrimaryAction}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              width: '100%',
              padding: '13px',
              borderRadius: 14,
              border: '1px solid #7158DC',
              background: primaryAction.isComplete ? '#F5F0FF' : '#7158DC',
              color: primaryAction.isComplete ? '#7158DC' : '#FFFFFF',
              cursor: 'pointer',
              boxShadow: primaryAction.isComplete
                ? 'none'
                : '0 10px 20px rgba(113,88,220,0.18)',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 800 }}>
              {primaryAction.icon}
            </span>

            <span
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 2,
              }}
            >
              <span style={{ fontSize: 12.5, fontWeight: 800 }}>
                {primaryAction.title}
              </span>

              <span style={{ fontSize: 10.5, opacity: 0.8, fontWeight: 600 }}>
                {primaryAction.subtitle}
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsFeedbackOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              width: '100%',
              marginTop: 10,
              padding: '11px 12px',
              borderRadius: 13,
              border: '1px solid #DDD7CC',
              background: '#FFFFFF',
              color: '#5F5B56',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                width: 19,
                height: 19,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 999,
                background: '#F5F0FF',
                border: '1px solid #E2D8FF',
                color: '#7158DC',
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
                alignItems: 'flex-start',
                gap: 1,
              }}
            >
              <span style={{ fontSize: 12.5, fontWeight: 700 }}>
                Share feedback
              </span>

              <span style={{ fontSize: 10.5, color: '#817B73' }}>
                Help improve PATH360
              </span>
            </span>
          </button>
        </nav>

        <div
          style={{
            padding: '14px 14px 18px',
            borderTop: '1px solid #D9D4CA',
            background: 'rgba(255,255,255,0.32)',
          }}
        >
          <div
            style={{
              border: '1px solid #D6E4D7',
              borderRadius: 14,
              background: '#EEF4EF',
              padding: 12,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: '#2A6A51',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 5,
                fontWeight: 700,
              }}
            >
              {tierLabel}
            </div>

            <div
              style={{
                fontSize: 12.5,
                color: '#1A1A18',
                fontWeight: 700,
              }}
            >
              {displayName}
            </div>

            <div
              style={{
                fontSize: 11,
                color: '#6E6B65',
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