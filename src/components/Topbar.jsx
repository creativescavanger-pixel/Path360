import { useLocation, useNavigate } from 'react-router-dom'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import { track, EVENTS } from '../lib/posthogClient.js'

const PAGE_TITLES = {
  '/app/dashboard': 'Command Center',
  '/app/assessment': 'Founder Assessment',
  '/app/stage-onboarding': 'Founder Baseline',
  '/app/founder-profile': 'Venture Profile',
  '/app/studio': 'Creation Studio',
  '/app/memory': 'Decisions & Insights',
  '/app/radar': 'Venture Radar',
  '/app/academy': 'Academy',
  '/app/reports': 'Reports',
}

const PAGE_CRUMBS = {
  '/app/dashboard': 'Performance overview',
  '/app/assessment': 'Founder intelligence interview',
  '/app/stage-onboarding': 'Founder operating system',
  '/app/founder-profile': 'Your strategic source of truth',
  '/app/studio': 'Strategic document generation',
  '/app/memory': 'Founder insight archive',
  '/app/radar': 'Market and venture monitoring',
  '/app/academy': 'Founder learning path',
  '/app/reports': 'Institutional reporting',
}

function getCurrentPageValue(pathname, assessmentResults, stageAssessment) {
  if (pathname.startsWith('/app/assessment')) {
    return assessmentResults
      ? {
          label: 'Assessment complete',
          color: '#1D6B4F',
          background: '#EDF6F0',
          border: '#CEE4D6',
        }
      : {
          label: 'In progress',
          color: '#7158DC',
          background: '#F5F0FF',
          border: '#E2D8FF',
        }
  }

  if (pathname.startsWith('/app/academy')) {
    return assessmentResults
      ? {
          label: 'Learning path unlocked',
          color: '#7158DC',
          background: '#F5F0FF',
          border: '#E2D8FF',
        }
      : {
          label: 'Unlock with assessment',
          color: '#76628D',
          background: '#F8F5FF',
          border: '#E7DFFF',
        }
  }

  if (pathname.startsWith('/app/stage-onboarding')) {
    return stageAssessment
      ? {
          label: 'Baseline saved',
          color: '#7158DC',
          background: '#F5F0FF',
          border: '#E2D8FF',
        }
      : {
          label: 'Set your baseline',
          color: '#7158DC',
          background: '#F5F0FF',
          border: '#E2D8FF',
        }
  }

  if (assessmentResults) {
    return {
      label: 'Intelligence active',
      color: '#1D6B4F',
      background: '#EDF6F0',
      border: '#CEE4D6',
    }
  }

  return {
    label: 'Build your baseline',
    color: '#7158DC',
    background: '#F5F0FF',
    border: '#E2D8FF',
  }
}

export default function Topbar() {
  const location = useLocation()
  const navigate = useNavigate()

  const title =
    PAGE_TITLES[location.pathname] ||
    'PATH360'

  const crumb =
    PAGE_CRUMBS[location.pathname] ||
    'Founder operating system'

  const results = useDiagnosticStore((s) => s.assessmentResults)
  const tier = useDiagnosticStore((s) => s.subscriptionTier)
  const founderProfile = useDiagnosticStore((s) => s.founderProfile)
  const stageAssessment = useDiagnosticStore((s) => s.stageAssessment)

  const investorReady = results?.investorreadiness ?? null

  const ventureName =
    founderProfile?.venturename ||
    founderProfile?.venture_name ||
    'Founder workspace'

  const pageValue = getCurrentPageValue(
    location.pathname,
    results,
    stageAssessment
  )

  function handleShareScore() {
    track(EVENTS.SCORESHARED)

    if (!results) {
      alert('Complete an assessment first.')
      return
    }

    const text =
      `PATH360 Founder Score: ${results.founderscore}/100 | ` +
      `Investor Readiness: ${results.investorreadiness}/100`

    navigator.clipboard
      .writeText(text)
      .then(() => alert('Score summary copied to clipboard.'))
      .catch(() => alert(text))
  }

  function handlePrimaryAction() {
    if (!results) {
      navigate('/app/assessment')
      return
    }

    if (location.pathname.startsWith('/app/academy')) {
      navigate('/app/academy')
      return
    }

    track(EVENTS.UPGRADECLICKED, {
      fromTier: tier,
      location: 'topbar',
    })

    navigate('/app/studio')
  }

  const primaryActionLabel = !results
    ? 'Complete assessment'
    : location.pathname.startsWith('/app/academy')
      ? 'Continue learning'
      : tier !== 'scale'
        ? 'Unlock PATH360'
        : 'Open Studio'

  return (
    <>
      <div
        className="p360-topbar-left"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          minWidth: 0,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            className="p360-breadcrumb"
            style={{
              fontSize: 11.5,
              color: '#8A877F',
              lineHeight: 1.2,
            }}
          >
            {crumb}
          </div>

          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: 'var(--text, #1C1C1A)',
              lineHeight: 1.1,
              marginTop: 4,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </div>
        </div>

        <div
          className="p360-chip"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            maxWidth: 180,
            minHeight: 34,
            padding: '0 11px',
            borderRadius: 999,
            border: '1px solid #E0DBD2',
            background: 'rgba(255,255,255,0.68)',
            color: '#5F5A54',
            fontSize: 12,
            fontWeight: 700,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {ventureName}
        </div>
      </div>

      <div
        className="p360-topbar-right"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            minHeight: 34,
            padding: '0 10px',
            borderRadius: 999,
            border: `1px solid ${pageValue.border}`,
            background: pageValue.background,
            color: pageValue.color,
            fontSize: 11.5,
            fontWeight: 800,
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: 999,
              background: pageValue.color,
            }}
          />

          {pageValue.label}
        </div>

        {investorReady !== null ? (
          <div
            className="p360-score-pill"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              minHeight: 34,
              padding: '0 10px',
              borderRadius: 999,
              border: '1px solid #CEE4D6',
              background: '#EDF6F0',
              color: '#1D6B4F',
              fontSize: 11.5,
              fontWeight: 800,
              whiteSpace: 'nowrap',
            }}
          >
            <span
              className="p360-score-dot"
              style={{
                width: 7,
                height: 7,
                borderRadius: 999,
                background: '#1D6B4F',
              }}
            />

            {investorReady}% Investor Ready
          </div>
        ) : null}

        {results ? (
          <button
            type="button"
            onClick={handleShareScore}
            className="p360-btn-secondary"
            style={{
              minHeight: 36,
              padding: '0 12px',
              borderRadius: 10,
              border: '1px solid #E0DBD2',
              background: 'rgba(255,255,255,0.68)',
              color: '#59554E',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Share Score
          </button>
        ) : null}

        <button
          type="button"
          onClick={handlePrimaryAction}
          className="p360-btn-primary"
          style={{
            minHeight: 36,
            padding: '0 13px',
            borderRadius: 10,
            border: '1px solid #7158DC',
            background: !results
              ? '#7158DC'
              : '#1D6B4F',
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: !results
              ? '0 8px 16px rgba(113,88,220,0.18)'
              : '0 8px 16px rgba(29,107,79,0.14)',
          }}
        >
          {primaryActionLabel}
        </button>
      </div>
    </>
  )
}