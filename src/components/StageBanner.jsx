import { Link, useLocation } from 'react-router-dom'
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
      return 'You are still shaping the problem, customer, and early opportunity.'
    case 'discovery':
      return 'You have early customer evidence, but the opportunity still needs deeper validation.'
    case 'validation':
      return 'You have a real problem and an emerging solution, but market proof is still forming.'
    case 'mvp':
      return 'You have something in market and now need stronger usage and repeatable proof.'
    case 'early_revenue':
      return 'Customers are beginning to pay, but repeatability and retention still need to strengthen.'
    case 'pmf':
      return 'You are showing strong signs of pull and should now build more disciplined growth.'
    case 'growth':
      return 'You have moved beyond early validation and should now focus on scale and execution.'
    default:
      return 'Path360 is using your onboarding answers to guide your next logical moves.'
  }
}

export default function StageBanner() {
  const location = useLocation()
  const stageAssessment = useDiagnosticStore((s) => s.stageAssessment)
  const assessmentResults = useDiagnosticStore((s) => s.assessmentResults)

  if (!stageAssessment || location.pathname === '/app/stage-onboarding') {
    return null
  }

  const stageId = stageAssessment?.diagnosedStage || 'validation'
  const meta = STAGE_META[stageId] || STAGE_META.validation
  const summaryText =
    stageAssessment?.summary?.headline ||
    defaultSummaryForStage(stageId)

  const reasonText =
    stageAssessment?.summary?.reasons?.[0] ||
    'This stage is based on your onboarding checklist answers and current founder signals.'

  const nextSteps =
    Array.isArray(stageAssessment?.summary?.gaps) && stageAssessment.summary.gaps.length > 0
      ? stageAssessment.summary.gaps.slice(0, 3)
      : meta.nextSteps

  const primaryCta =
    assessmentResults
      ? { to: '/app/studio', label: 'Open Studio' }
      : { to: '/app/assessment', label: 'Continue assessment' }

  return (
    <div
      style={{
        marginBottom: 18,
        background: meta.bg,
        border: `1px solid ${meta.border}`,
        borderRadius: 16,
        padding: 16,
        boxShadow: '0 6px 16px rgba(22,24,27,0.04)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 0.9fr)',
          gap: 16,
          alignItems: 'start',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '5px 10px',
                borderRadius: 999,
                background: '#FFFFFF',
                border: `1px solid ${meta.border}`,
                color: meta.color,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Current stage
            </span>

            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: meta.color,
              }}
            >
              {meta.label}
            </span>
          </div>

          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#1C1C1A',
              marginBottom: 6,
              lineHeight: 1.35,
            }}
          >
            {summaryText}
          </div>

          <div
            style={{
              fontSize: 12.5,
              color: '#5F675F',
              lineHeight: 1.7,
              maxWidth: 720,
            }}
          >
            {reasonText}
          </div>
        </div>

        <div
          style={{
            background: '#FFFFFF',
            border: `1px solid ${meta.border}`,
            borderRadius: 12,
            padding: 12,
          }}
        >
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 800,
              color: '#1C1C1A',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Next logical steps
          </div>

          <div style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
            {nextSteps.slice(0, 3).map((step, idx) => (
              <div
                key={idx}
                style={{
                  fontSize: 12.5,
                  color: '#6B6965',
                  lineHeight: 1.6,
                }}
              >
                • {step}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link
              to={primaryCta.to}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '9px 12px',
                borderRadius: 10,
                background: meta.color,
                color: '#FFFFFF',
                textDecoration: 'none',
                fontSize: 12.5,
                fontWeight: 700,
              }}
            >
              {primaryCta.label}
            </Link>

            <Link
              to="/app/founder-profile"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '9px 12px',
                borderRadius: 10,
                background: '#F7F5F0',
                border: '1px solid #E2DED6',
                color: '#1C1C1A',
                textDecoration: 'none',
                fontSize: 12.5,
                fontWeight: 700,
              }}
            >
              Review profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}