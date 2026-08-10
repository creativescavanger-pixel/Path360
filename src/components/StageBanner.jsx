import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'

const STAGE_META = {
  idea: {
    label: 'Idea',
    color: '#7A5C1B',
    bg: '#FCF6E8',
    border: '#E9D9AE',
    nextSteps: [
      'Define the problem clearly.',
      'Interview target customers.',
      'Sharpen your target segment.',
    ],
  },
  discovery: {
    label: 'Discovery',
    color: '#8A6E2A',
    bg: '#FCF8EE',
    border: '#EEE4C9',
    nextSteps: [
      'Validate repeated customer pain.',
      'Map current alternatives.',
      'Shape the first solution hypothesis.',
    ],
  },
  validation: {
    label: 'Validation',
    color: '#1D6B4F',
    bg: '#EDF6F0',
    border: '#CEE4D6',
    nextSteps: [
      'Put an MVP or prototype in users’ hands.',
      'Track real traction signals.',
      'Test willingness to pay.',
    ],
  },
  mvp: {
    label: 'MVP',
    color: '#0F5E64',
    bg: '#EEF7F8',
    border: '#D1E7E9',
    nextSteps: [
      'Improve product usage and onboarding.',
      'Track which users engage repeatedly.',
      'Turn interest into initial revenue.',
    ],
  },
  traction: {
    label: 'Traction',
    color: '#7D4C8E',
    bg: '#F5F0F9',
    border: '#E2D4EC',
    nextSteps: [
      'Strengthen retention and repeat engagement.',
      'Clarify your best-fit customer.',
      'Turn traction into repeatable growth.',
    ],
  },
  early_revenue: {
    label: 'Early Revenue',
    color: '#7D4C8E',
    bg: '#F5F0F9',
    border: '#E2D4EC',
    nextSteps: [
      'Strengthen retention.',
      'Clarify your best-fit customer.',
      'Build repeatable revenue patterns.',
    ],
  },
  pmf: {
    label: 'PMF',
    color: '#2E5EAA',
    bg: '#EFF4FB',
    border: '#D6E3F5',
    nextSteps: [
      'Systematize growth.',
      'Improve operating metrics.',
      'Prepare stronger investor materials.',
    ],
  },
  growth: {
    label: 'Growth',
    color: '#1F4D3A',
    bg: '#EDF4EE',
    border: '#D3E1D7',
    nextSteps: [
      'Scale acquisition with discipline.',
      'Improve reporting and investor readiness.',
      'Strengthen strategic execution.',
    ],
  },
}

function defaultSummaryForStage(stageId) {
  switch (stageId) {
    case 'idea':
      return 'You are shaping the problem, customer, and early opportunity.'
    case 'discovery':
      return 'You have early customer evidence and are refining the opportunity.'
    case 'validation':
      return 'You have a real problem and emerging solution, but market proof is still forming.'
    case 'mvp':
      return 'You have something in market and now need stronger usage and repeatable proof.'
    case 'traction':
      return 'You have early demand signals and now need stronger evidence of repeatability.'
    case 'early_revenue':
      return 'Customers are beginning to pay, but repeatability and retention still need to strengthen.'
    case 'pmf':
      return 'You are showing signs of pull and should now build more disciplined growth.'
    case 'growth':
      return 'You have moved beyond early validation and should focus on scale and execution.'
    default:
      return 'PATH360 is using your stage baseline to guide your next practical moves.'
  }
}

function formatDate(dateValue) {
  if (!dateValue) return null

  try {
    return new Intl.DateTimeFormat('en', {
      day: 'numeric',
      month: 'short',
    }).format(new Date(dateValue))
  } catch {
    return null
  }
}

export default function StageBanner() {
  const location = useLocation()
  const [isExpanded, setIsExpanded] = useState(false)

  const stageAssessment = useDiagnosticStore((s) => s.stageAssessment)
  const assessmentResults = useDiagnosticStore((s) => s.assessmentResults)

  if (
    !stageAssessment ||
    location.pathname === '/app/stage-onboarding'
  ) {
    return null
  }

  const stageId =
    stageAssessment?.diagnosedStage ||
    stageAssessment?.declaredStage ||
    'validation'

  const meta = STAGE_META[stageId] || STAGE_META.validation

  const summaryText =
    stageAssessment?.summary?.headline ||
    defaultSummaryForStage(stageId)

  const reasonText =
    stageAssessment?.summary?.reasons?.[0] ||
    'Based on your stage baseline and the evidence you recorded.'

  const nextSteps =
    Array.isArray(stageAssessment?.summary?.gaps) &&
    stageAssessment.summary.gaps.length > 0
      ? stageAssessment.summary.gaps.slice(0, 3)
      : meta.nextSteps

  const primaryCta = assessmentResults
    ? {
        to: '/app/studio',
        label: 'Create from priorities',
      }
    : {
        to: '/app/assessment',
        label: 'Complete assessment',
      }

  const updatedDate = formatDate(stageAssessment?.completedAt)

  return (
    <section
      aria-label="Venture Pulse"
      style={{
        marginBottom: 14,
        border: `1px solid ${meta.border}`,
        borderRadius: 16,
        background:
          'linear-gradient(100deg, #FFFFFF 0%, #FCFBFF 55%, #F5F0FF 100%)',
        boxShadow: '0 6px 16px rgba(22,24,27,0.035)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          padding: '12px 14px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            minWidth: 0,
            flex: '1 1 420px',
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              borderRadius: 10,
              background: '#EEE8FF',
              border: '1px solid #DDD1FF',
              color: '#7158DC',
              fontSize: 15,
              fontWeight: 900,
            }}
          >
            ✦
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexWrap: 'wrap',
                marginBottom: 2,
              }}
            >
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 800,
                  color: '#7158DC',
                  textTransform: 'uppercase',
                  letterSpacing: '0.11em',
                }}
              >
                Venture Pulse
              </span>

              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: 999,
                  background: meta.bg,
                  border: `1px solid ${meta.border}`,
                  color: meta.color,
                  fontSize: 10.5,
                  fontWeight: 800,
                }}
              >
                {meta.label}
              </span>

              {updatedDate ? (
                <span
                  style={{
                    fontSize: 10.5,
                    color: '#8B829B',
                  }}
                >
                  Updated {updatedDate}
                </span>
              ) : null}
            </div>

            <div
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: '#343047',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              Current focus: {summaryText}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <Link
            to={primaryCta.to}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 34,
              padding: '0 11px',
              borderRadius: 9,
              background: '#7158DC',
              color: '#FFFFFF',
              textDecoration: 'none',
              fontSize: 11.5,
              fontWeight: 800,
              boxShadow: '0 7px 14px rgba(113,88,220,0.18)',
            }}
          >
            {primaryCta.label}
          </Link>

          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            aria-expanded={isExpanded}
            style={{
              minHeight: 34,
              padding: '0 11px',
              borderRadius: 9,
              border: '1px solid #DED8EF',
              background: '#FFFFFF',
              color: '#574F6E',
              fontSize: 11.5,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {isExpanded ? 'Hide details' : 'View next move'}
          </button>
        </div>
      </div>

      {isExpanded ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(260px, 0.8fr)',
            gap: 16,
            padding: '14px',
            borderTop: '1px solid #E7E1F4',
            background: 'rgba(255,255,255,0.72)',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: '#7158DC',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              Why this matters now
            </div>

            <div
              style={{
                maxWidth: 700,
                color: '#625B70',
                fontSize: 12.5,
                lineHeight: 1.65,
              }}
            >
              {reasonText}
            </div>

            <Link
              to="/app/stage-onboarding"
              style={{
                display: 'inline-flex',
                marginTop: 12,
                color: '#7158DC',
                fontSize: 12,
                fontWeight: 800,
                textDecoration: 'none',
              }}
            >
              Re-baseline my stage →
            </Link>
          </div>

          <div
            style={{
              padding: 12,
              border: '1px solid #E2D8FF',
              borderRadius: 12,
              background: '#FAF8FF',
            }}
          >
            <div
              style={{
                color: '#40385A',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              Your next logical moves
            </div>

            <div style={{ display: 'grid', gap: 7 }}>
              {nextSteps.slice(0, 3).map((step, index) => (
                <div
                  key={`${step}-${index}`}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    color: '#625B70',
                    fontSize: 12,
                    lineHeight: 1.55,
                  }}
                >
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                      borderRadius: 999,
                      background: '#E9E1FF',
                      color: '#7158DC',
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    {index + 1}
                  </span>

                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}