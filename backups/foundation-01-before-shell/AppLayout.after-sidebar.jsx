import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import Topbar from '../components/Topbar.jsx'
import AIStrategistRail from '../components/AIStrategistRail.jsx'
import StageBanner from '../components/StageBanner.jsx'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import { signOut } from '../lib/supabaseClient.js'
import { getPageIdentity } from '../lib/pageIdentity.js'

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const founderProfile = useDiagnosticStore((state) => state.founderProfile)
  const clearSessionOnly = useDiagnosticStore(
    (state) => state.clearSessionOnly,
  )

  const founderName =
    founderProfile?.foundername ||
    founderProfile?.fullname ||
    founderProfile?.name ||
    'Founder'

  const ventureName =
    founderProfile?.venturename ||
    founderProfile?.venture_name ||
    founderProfile?.businessname ||
    founderProfile?.companyname ||
    'Your business'

  const pageIdentity = getPageIdentity(location.pathname)

  const isOnStageOnboarding =
    location.pathname === '/app/stage-onboarding'

  const isOnVentureIntelligence =
    location.pathname === '/app/venture-intelligence'

  const shouldShowSharedPageIntro =
    !isOnStageOnboarding && !isOnVentureIntelligence

  async function handleLogout(event) {
    event.preventDefault()

    try {
      await signOut()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      clearSessionOnly()
      navigate('/', { replace: true })
    }
  }

  return (
    <div className="p360-shell">
      <aside className="p360-shell-sidebar">
        <div className="p360-sidebar-scroll">
          <Sidebar />
        </div>

        <div
          style={{
            padding: 14,
            borderTop: '1px solid var(--border)',
            background: 'var(--surface)',
          }}
        >
          <div className="p360-sidebar-profile">
            <div className="p360-label">Founder account</div>

            <div
              style={{
                color: 'var(--text)',
                fontSize: 13,
                fontWeight: 800,
                marginBottom: 2,
              }}
            >
              {founderName}
            </div>

            <div
              style={{
                color: 'var(--text-soft)',
                fontSize: 11.5,
                marginBottom: 11,
              }}
            >
              {ventureName}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <Link
                to="/app/founder-profile"
                className="p360-btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 34,
                  padding: '0 10px',
                  fontSize: 11.5,
                }}
              >
                Profile
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="p360-btn-ghost"
                style={{
                  minHeight: 34,
                  padding: '0 10px',
                  fontSize: 11.5,
                }}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="p360-shell-main">
        <header className="p360-shell-topbar">
          <Topbar />
        </header>

        <main className="p360-shell-content">
          {!isOnStageOnboarding && <StageBanner />}

          {shouldShowSharedPageIntro && (
            <section
              aria-labelledby="page-title"
              className="p360-card-soft"
              style={{
                marginBottom: 16,
                padding: '15px 18px',
                background: pageIdentity.softBg,
                borderColor: pageIdentity.border,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 16,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    className="p360-kicker"
                    style={{
                      color: pageIdentity.accent,
                      marginBottom: 5,
                    }}
                  >
                    {pageIdentity.eyebrow}
                  </div>

                  <h1
                    id="page-title"
                    style={{
                      margin: 0,
                      color: 'var(--text)',
                      fontSize: 24,
                      fontWeight: 800,
                      letterSpacing: '-0.035em',
                      lineHeight: 1.14,
                    }}
                  >
                    {pageIdentity.title}
                  </h1>

                  <p
                    style={{
                      maxWidth: 760,
                      margin: '6px 0 0',
                      color: 'var(--text-soft)',
                      fontSize: 12.5,
                      lineHeight: 1.62,
                    }}
                  >
                    {pageIdentity.description}
                  </p>
                </div>

                {pageIdentity.status ? (
                  <div
                    className="p360-chip"
                    style={{
                      flexShrink: 0,
                      minHeight: 32,
                      padding: '0 10px',
                      borderColor: pageIdentity.border,
                      color: pageIdentity.accent,
                      fontSize: 10.5,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 999,
                        background: pageIdentity.accent,
                      }}
                    />
                    {pageIdentity.status}
                  </div>
                ) : null}
              </div>
            </section>
          )}

          <div className="p360-shell-content-inner fade-up">
            <Outlet />
          </div>
        </main>
      </div>

      <aside className="p360-shell-rail">
        <AIStrategistRail />
      </aside>
    </div>
  )
}