import { useLocation, useNavigate } from 'react-router-dom'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import { track, EVENTS } from '../lib/posthogClient.js'

const PAGE_TITLES = {
  '/app/dashboard': 'Command Center',
  '/app/assessment': 'Founder Assessment',
  '/app/studio': 'Creation Studio',
  '/app/memory': 'Founder Memory',
  '/app/radar': 'Venture Radar',
  '/app/reports': 'Reports',
}

const PAGE_CRUMBS = {
  '/app/dashboard': 'Performance overview',
  '/app/assessment': 'Founder intelligence interview',
  '/app/studio': 'Strategic document generation',
  '/app/memory': 'Founder insight archive',
  '/app/radar': 'Market and venture monitoring',
  '/app/reports': 'Institutional reporting',
}

export default function Topbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const title = PAGE_TITLES[location.pathname] || 'PATH360'
  const crumb = PAGE_CRUMBS[location.pathname] || 'Founder operating system'

  const results = useDiagnosticStore((s) => s.assessmentResults)
  const tier = useDiagnosticStore((s) => s.subscriptionTier)
  const founderProfile = useDiagnosticStore((s) => s.founderProfile)

  const investorReady = results?.investorreadiness ?? null
  const ventureName = founderProfile?.venturename || 'Founder workspace'

  function handleShareScore() {
    track(EVENTS.SCORESHARED)

    if (!results) {
      alert('Complete an assessment first.')
      return
    }

    const text = `PATH360 Founder Score: ${results.founderscore}/100 | Investor Readiness: ${results.investorreadiness}/100`
    navigator.clipboard
      .writeText(text)
      .then(() => alert('Score summary copied to clipboard.'))
      .catch(() => alert(text))
  }

  function handleUpgrade() {
    track(EVENTS.UPGRADECLICKED, { fromTier: tier, location: 'topbar' })
    navigate('/app/studio')
  }

  return (
    <>
      <div className="p360-topbar-left">
        <div style={{ minWidth: 0 }}>
          <div className="p360-breadcrumb">{crumb}</div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: 'var(--text)',
              lineHeight: 1.1,
              marginTop: 4,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </div>
        </div>

        <div className="p360-chip">
          <span>{ventureName}</span>
        </div>
      </div>

      <div className="p360-topbar-right">
        {investorReady !== null && (
          <div className="p360-score-pill">
            <span className="p360-score-dot" />
            <span>{investorReady}% Investor Ready</span>
          </div>
        )}

        <button onClick={handleShareScore} className="p360-btn-secondary">
          Share Score
        </button>

        {tier !== 'scale' && (
          <button onClick={handleUpgrade} className="p360-btn-primary">
            Unlock PATH360
          </button>
        )}
      </div>
    </>
  )
}