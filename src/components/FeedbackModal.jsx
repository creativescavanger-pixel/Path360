import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

const OVERLAY_Z_INDEX = 2147483646
const MODAL_Z_INDEX = 2147483647

function getScreenLabel(pagePath = '', pageLabel = '') {
  if (pageLabel) return pageLabel

  const routeMap = {
    '/app/studio': 'Creation Studio',
    '/app/assessment': 'Assessment Results',
    '/app/dashboard': 'Founder Dashboard',
    '/app/profile': 'Founder Profile',
  }

  return routeMap[pagePath] || pagePath || 'Current page'
}

export default function FeedbackModal({
  open,
  onClose,
  pagePath = '',
  pageLabel = '',
  ventureName = '',
  founderId = '',
  onSubmitFeedback,
}) {
  const [feedbackType, setFeedbackType] = useState('suggestion')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const friendlyScreenName = useMemo(
    () => getScreenLabel(pagePath, pageLabel),
    [pagePath, pageLabel]
  )

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
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
      setError('')
    }
  }, [open])

  if (!open) return null

  async function handleSubmit(event) {
    event.preventDefault()
    if (!message.trim()) return

    setSubmitting(true)
    setError('')

    const payload = {
      founder_id: founderId || null,
      feedback_type: feedbackType,
      message: message.trim(),
      page: pagePath || null,
      page_label: friendlyScreenName,
      venture_name: ventureName || null,
      created_at: new Date().toISOString(),
    }

    try {
      if (onSubmitFeedback) {
        await onSubmitFeedback(payload)
      } else {
        console.log('Founder feedback payload:', payload)
        await new Promise((resolve) => setTimeout(resolve, 700))
      }

      setSubmitted(true)
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
          background: 'rgba(17, 20, 18, 0.52)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          zIndex: OVERLAY_Z_INDEX,
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="founder-feedback-title"
        aria-describedby="founder-feedback-description"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: MODAL_Z_INDEX,
          display: 'grid',
          placeItems: 'center',
          padding: 24,
          pointerEvents: 'none',
        }}
      >
        <div
          onClick={(event) => event.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 560,
            maxHeight: 'calc(100vh - 48px)',
            overflowY: 'auto',
            background: '#FFFFFF',
            border: '1px solid #E4DED3',
            borderRadius: 20,
            boxShadow: '0 28px 80px rgba(0,0,0,0.22)',
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              padding: '20px 22px 16px',
              background: '#F8F6F1',
              borderBottom: '1px solid #ECE6DB',
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: '#1D6B4F',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              Founder feedback
            </div>

            <div
              id="founder-feedback-title"
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: '#1C1C1A',
                marginBottom: 8,
              }}
            >
              Help improve Path360
            </div>

            <div
              id="founder-feedback-description"
              style={{
                fontSize: 13,
                color: '#6B6965',
                lineHeight: 1.65,
              }}
            >
              We value your feedback. Your comments help us improve this page and make Path360 better for founders.
            </div>
          </div>

          <div style={{ padding: 22 }}>
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
                    fontWeight: 700,
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
                  We appreciate your input. Your note has been captured so the team can improve this page experience properly.
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
                    minHeight: 44,
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
                    onChange={(event) => setFeedbackType(event.target.value)}
                    style={{
                      width: '100%',
                      height: 44,
                      borderRadius: 12,
                      border: '1px solid #D9D4CA',
                      padding: '0 12px',
                      background: '#FFFFFF',
                      fontSize: 14,
                      color: '#1C1C1A',
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
                    onChange={(event) => setMessage(event.target.value)}
                    rows={6}
                    placeholder="What felt confusing, missing, or could work better on this page?"
                    style={{
                      width: '100%',
                      borderRadius: 14,
                      border: '1px solid #D9D4CA',
                      padding: 14,
                      fontSize: 14,
                      lineHeight: 1.6,
                      resize: 'vertical',
                      color: '#1C1C1A',
                      background: '#FFFFFF',
                    }}
                  />
                </div>

                <div
                  style={{
                    background: '#F7F4EE',
                    border: '1px solid #E5DED1',
                    borderRadius: 12,
                    padding: 12,
                    fontSize: 12,
                    color: '#6B6965',
                    lineHeight: 1.6,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#7A746B',
                      marginBottom: 6,
                    }}
                  >
                    Feedback for this page
                  </div>

                  <div>
                    <strong>Screen:</strong> {friendlyScreenName}
                  </div>

                  {ventureName ? (
                    <div>
                      <strong>Venture:</strong> {ventureName}
                    </div>
                  ) : null}
                </div>

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
                      padding: '10px 14px',
                      borderRadius: 12,
                      border: '1px solid #D9D4CA',
                      background: '#FFFFFF',
                      fontWeight: 600,
                      color: '#4B4A46',
                      cursor: 'pointer',
                      minHeight: 44,
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={!message.trim() || submitting}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 12,
                      border: '1px solid #1D6B4F',
                      background: '#1D6B4F',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      cursor: 'pointer',
                      opacity: !message.trim() || submitting ? 0.6 : 1,
                      minHeight: 44,
                    }}
                  >
                    {submitting ? 'Sending...' : 'Submit feedback'}
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