import { Outlet, Link, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import Topbar from '../components/Topbar.jsx'
import AIStrategistRail from '../components/AIStrategistRail.jsx'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import supabase from '../lib/supabaseClient.js'

export default function AppLayout() {
  const navigate = useNavigate()
  const assessmentResults = useDiagnosticStore((s) => s.assessmentResults)
  const founderProfile = useDiagnosticStore((s) => s.founderProfile)
  const resetAll = useDiagnosticStore((s) => s.resetAll)

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

  async function handleLogout(e) {
    e.preventDefault()

    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      resetAll()
      navigate('/auth', { replace: true })
    }
  }

  return (
    <div
      className="p360-shell"
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '268px minmax(0, 1fr) 320px',
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
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
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
            <div style={{ fontSize: 11, color: '#8C8A84', marginBottom: 4 }}>Founder</div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1C1C1A', marginBottom: 2 }}>
              {founderName}
            </div>
            <div style={{ fontSize: 12, color: '#6B6965', marginBottom: 10 }}>{ventureName}</div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
                  textDecoration: 'none',
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
            padding: 22,
          }}
        >
          {!assessmentResults && (
            <div
              className="fade-up"
              style={{
                marginBottom: 20,
                background: 'var(--info-bg, #EDF4EE)',
                border: '1px solid rgba(33,95,70,0.14)',
                borderRadius: 14,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                boxShadow: 'var(--shadow-sm, 0 6px 16px rgba(22,24,27,0.04))',
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 999,
                  background: 'rgba(33,95,70,0.10)',
                  color: 'var(--info, #1D6B4F)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 13,
                  fontWeight: 800,
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                i
              </div>

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: 'var(--info, #1D6B4F)',
                    fontWeight: 600,
                  }}
                >
                  Complete your founder assessment to unlock your full intelligence dashboard.
                </div>

                <Link
                  to="/app/assessment"
                  style={{
                    display: 'inline-block',
                    marginTop: 6,
                    fontSize: 13,
                    color: 'var(--info, #1D6B4F)',
                    fontWeight: 700,
                    textDecoration: 'underline',
                    textUnderlineOffset: 3,
                  }}
                >
                  Start now →
                </Link>
              </div>
            </div>
          )}

          <div
            className="p360-shell-content-inner fade-up"
            style={{
              minWidth: 0,
            }}
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