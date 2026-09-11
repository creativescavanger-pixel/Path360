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

  /*
   * Venture Intelligence has a dedicated strategic header, status chips,
   * tabs, and action controls in its page component. Do not show the generic
   * AppLayout introduction above it, or founders see two stacked headings.
   */
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
    <div
      className="p360-shell"
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '268px minmax(0, 1fr) 286px',
        background: 'var(--app-bg, #F3EFE7)',
      }}
    >
      <aside
        className="p360-shell-sidebar"
        style={{
          minHeight: '100vh',
          position: 'sticky',
          top: 0,
          alignSelf: 'start',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(217,212,202,0.75)',
          background: '#F8F4EC',
        }}
      >
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
          }}
        >
          <Sidebar />
        </div>

        <div
          style={{
            marginTop: 'auto',
            padding: 16,
            borderTop: '1px solid rgba(217,212,202,0.75)',
            background: 'rgba(255,255,255,0.56)',
          }}
        >
          <div
            style={{
              border: '1px solid #E2DED6',
              borderRadius: 14,
              background: '#FFFFFF',
              padding: 14,
              boxShadow: '0 6px 16px rgba(22,24,27,0.04)',
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: '#8C8A84',
                marginBottom: 4,
              }}
            >
              Founder
            </div>

            <div
              style={{
                fontSize: 13.5,
                fontWeight: 700,
                color: '#1C1C1A',
                marginBottom: 2,
              }}
            >
              {founderName}
            </div>

            <div
              style={{
                fontSize: 12,
                color: '#6B6965',
                marginBottom: 10,
              }}
            >
              {ventureName}
            </div>

            <div
              style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
              }}
            >
              <Link
                to="/app/founder-profile"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 10px',
                  borderRadius: 9,
                  border: '1px solid #E2DED6',
                  background: '#F7F5F0',
                  color: '#1C1C1A',
                  fontSize: 12,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Profile
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 10px',
                  borderRadius: 9,
                  border: '1px solid #E2DED6',
                  background: 'transparent',
                  color: '#6B6965',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div
        className="p360-shell-main"
        style={{
          minWidth: 0,
          minHeight: '100vh',
          display: 'grid',
          gridTemplateRows: 'auto minmax(0, 1fr)',
        }}
      >
        <div
          className="p360-shell-topbar"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 18,
            minHeight: 80,
            padding: '0 26px',
            background: 'rgba(243,239,231,0.92)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(217,212,202,0.75)',
          }}
        >
          <Topbar />
        </div>

        <main
          className="p360-shell-content"
          style={{
            minHeight: 0,
            overflowY: 'auto',
            padding: '20px 22px 40px',
          }}
        >
          {!isOnStageOnboarding && <StageBanner />}

          {shouldShowSharedPageIntro && (
            <section
              aria-labelledby="page-title"
              style={{
                marginBottom: 16,
                padding: '15px 18px',
                background: pageIdentity.softBg,
                border: `1px solid ${pageIdentity.border}`,
                borderRadius: 16,
                boxShadow: '0 6px 16px rgba(22,24,27,0.035)',
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
                    style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      letterSpacing: '0.13em',
                      textTransform: 'uppercase',
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
                      fontSize: 23,
                      fontWeight: 800,
                      letterSpacing: '-0.035em',
                      lineHeight: 1.15,
                      color: '#1C1C1A',
                    }}
                  >
                    {pageIdentity.title}
                  </h1>

                  <p
                    style={{
                      margin: '6px 0 0',
                      maxWidth: 760,
                      fontSize: 12.5,
                      color: '#5F675F',
                      lineHeight: 1.6,
                    }}
                  >
                    {pageIdentity.description}
                  </p>
                </div>

                {pageIdentity.status ? (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                      flexShrink: 0,
                      padding: '7px 10px',
                      borderRadius: 999,
                      border: `1px solid ${pageIdentity.border}`,
                      background: '#FFFFFF',
                      color: pageIdentity.accent,
                      fontSize: 11.5,
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
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

          <div
            className="p360-shell-content-inner fade-up"
            style={{ minWidth: 0 }}
          >
            <Outlet />
          </div>
        </main>
      </div>

      <aside
        className="p360-shell-rail"
        style={{
          minHeight: '100vh',
          position: 'sticky',
          top: 0,
          alignSelf: 'start',
        }}
      >
        <AIStrategistRail />
      </aside>
    </div>
  )
}